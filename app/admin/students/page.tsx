import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, GraduationCap, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { StudentFilters } from "./student-filters"
import { StudentDetailModal } from "./student-detail-modal"

const ITEMS_PER_PAGE = 15

interface StudentsPageProps {
  searchParams: Promise<{
    course?: string
    page?: string
    search?: string
  }>
}

async function getStudentsData(params: { courseId: string | null; page: number; search: string }) {
  const supabase = await createClient()
  const { courseId, page, search } = params
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Get all courses for filter
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug")
    .order("created_at", { ascending: false })

  // Get total student count
  const { count: totalStudents } = await supabase
    .from("course_purchases")
    .select("user_id", { count: "exact", head: true })
    .eq("status", "completed")

  // Get this month's new students
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: newStudentsThisMonth } = await supabase
    .from("course_purchases")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("purchased_at", monthStart.toISOString())

  // Build student query
  let purchasesQuery = supabase
    .from("course_purchases")
    .select(`
      id,
      user_id,
      course_id,
      amount_paid,
      purchased_at,
      user:profiles!course_purchases_user_id_fkey(id, full_name, email),
      course:courses!course_purchases_course_id_fkey(id, title, slug)
    `)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })

  if (courseId) {
    purchasesQuery = purchasesQuery.eq("course_id", courseId)
  }

  const { data: allPurchases } = await purchasesQuery

  // Filter by search
  let filteredPurchases = allPurchases || []
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPurchases = filteredPurchases.filter(
      (p: any) =>
        p.user?.full_name?.toLowerCase().includes(searchLower) ||
        p.user?.email?.toLowerCase().includes(searchLower)
    )
  }

  const totalCount = filteredPurchases.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const paginatedPurchases = filteredPurchases.slice(offset, offset + ITEMS_PER_PAGE)

  // Get lesson counts per course
  const courseIds = [...new Set(paginatedPurchases.map((p) => p.course_id))]
  const lessonCounts: Record<string, number> = {}

  for (const cid of courseIds) {
    const { count } = await supabase
      .from("course_lessons")
      .select("id", { count: "exact", head: true })
      .eq("section_id", supabase.from("course_sections").select("id").eq("course_id", cid))

    // Alternative: count via sections
    const { data: sections } = await supabase
      .from("course_sections")
      .select("id")
      .eq("course_id", cid)

    if (sections) {
      const sectionIds = sections.map((s) => s.id)
      const { count: lessonCount } = await supabase
        .from("course_lessons")
        .select("*", { count: "exact", head: true })
        .in("section_id", sectionIds)
        .eq("is_published", true)

      lessonCounts[cid] = lessonCount || 0
    }
  }

  // Get progress for each student-course pair
  const progressData: Record<string, { completed: number; lastWatched: string | null }> = {}

  for (const purchase of paginatedPurchases) {
    const key = `${purchase.user_id}-${purchase.course_id}`

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("is_completed, last_watched_at")
      .eq("user_id", purchase.user_id)
      .eq("course_id", purchase.course_id)

    const completed = progress?.filter((p) => p.is_completed).length || 0
    const lastWatched = progress?.sort(
      (a, b) => new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
    )[0]?.last_watched_at

    progressData[key] = { completed, lastWatched }
  }

  // Calculate average completion rate
  let totalCompletion = 0
  let completionCount = 0

  for (const purchase of filteredPurchases) {
    const totalLessons = lessonCounts[purchase.course_id] || 0
    if (totalLessons > 0) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("is_completed")
        .eq("user_id", purchase.user_id)
        .eq("course_id", purchase.course_id)
        .eq("is_completed", true)

      const completed = progress?.length || 0
      totalCompletion += (completed / totalLessons) * 100
      completionCount++
    }
  }

  const avgCompletionRate = completionCount > 0 ? Math.round(totalCompletion / completionCount) : 0

  // Format student data
  const students = paginatedPurchases.map((purchase: any) => {
    const key = `${purchase.user_id}-${purchase.course_id}`
    const progress = progressData[key] || { completed: 0, lastWatched: null }
    const totalLessons = lessonCounts[purchase.course_id] || 0
    const progressPercent = totalLessons > 0 ? Math.round((progress.completed / totalLessons) * 100) : 0

    return {
      odId: purchase.id,
      odUserId: purchase.user_id,
      userId: purchase.user?.id,
      userName: purchase.user?.full_name || "이름 없음",
      userEmail: purchase.user?.email || "",
      courseId: purchase.course_id,
      courseTitle: purchase.course?.title || "삭제된 강의",
      courseSlug: purchase.course?.slug,
      purchasedAt: purchase.purchased_at,
      amountPaid: purchase.amount_paid,
      completedLessons: progress.completed,
      totalLessons,
      progressPercent,
      lastWatched: progress.lastWatched,
    }
  })

  return {
    courses: courses || [],
    students,
    totalCount,
    totalPages,
    currentPage: page,
    stats: {
      totalStudents: totalStudents || 0,
      newStudentsThisMonth: newStudentsThisMonth || 0,
      avgCompletionRate,
    },
  }
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedParams = await searchParams
  const courseId = resolvedParams.course || null
  const page = parseInt(resolvedParams.page || "1", 10)
  const search = resolvedParams.search || ""

  const data = await getStudentsData({ courseId, page, search })

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (courseId) params.set("course", courseId)
    if (newPage !== 1) params.set("page", String(newPage))
    if (search) params.set("search", search)
    const queryString = params.toString()
    return `/admin/students${queryString ? `?${queryString}` : ""}`
  }

  const selectedCourse = data.courses.find((c) => c.id === courseId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">수강생 관리</h1>
        <p className="text-muted-foreground">강의별 수강생 현황 및 진도를 확인합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 수강생
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 신규
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.stats.newStudentsThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 완강률
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.avgCompletionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <StudentFilters
        courses={data.courses}
        currentCourse={courseId}
        currentSearch={search}
      />

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            수강생 목록
            {selectedCourse && (
              <Badge variant="secondary" className="ml-2">
                {selectedCourse.title}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {data.totalCount}명의 수강생
            {data.totalCount > 0 && ` (${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, data.totalCount)}번째)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.students.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>수강생</div>
                <div>강의</div>
                <div>진도율</div>
                <div>마지막 수강</div>
                <div>구매일</div>
                <div>상세</div>
              </div>

              {/* Student Rows */}
              {data.students.map((student) => (
                <div
                  key={student.odId}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{student.userName}</p>
                    <p className="text-xs text-muted-foreground">{student.userEmail}</p>
                  </div>

                  <div className="md:flex md:items-center">
                    <span className="text-sm truncate">{student.courseTitle}</span>
                  </div>

                  <div className="md:flex md:items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            student.progressPercent === 100
                              ? "bg-green-500"
                              : student.progressPercent > 50
                              ? "bg-blue-500"
                              : "bg-orange-500"
                          }`}
                          style={{ width: `${student.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {student.progressPercent}%
                        <span className="text-xs text-muted-foreground ml-1">
                          ({student.completedLessons}/{student.totalLessons})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="md:flex md:items-center text-sm text-muted-foreground">
                    {student.lastWatched
                      ? new Date(student.lastWatched).toLocaleDateString("ko-KR")
                      : "-"}
                  </div>

                  <div className="md:flex md:items-center text-sm text-muted-foreground">
                    {new Date(student.purchasedAt).toLocaleDateString("ko-KR")}
                  </div>

                  <div className="md:flex md:items-center">
                    <StudentDetailModal
                      odUserId={student.odUserId}
                      courseId={student.courseId}
                      userName={student.userName}
                      courseTitle={student.courseTitle}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {search || courseId ? "조건에 맞는 수강생이 없습니다" : "아직 수강생이 없습니다"}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={buildUrl(page - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </Link>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </>
                )}
              </Button>

              <span className="text-sm text-muted-foreground px-4">
                {page} / {data.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                asChild={page < data.totalPages}
              >
                {page < data.totalPages ? (
                  <Link href={buildUrl(page + 1)}>
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <>
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
