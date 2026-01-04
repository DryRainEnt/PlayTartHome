import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProfileSettings } from "@/components/profile-settings"

export default async function MyPagePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get purchased courses with progress
  const { data: purchases } = await supabase
    .from("course_purchases")
    .select(
      `
      *,
      course:courses(*)
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })

  // Get learning progress for each course
  const courseIds = purchases?.map((p: any) => p.course_id) || []
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("course_id, is_completed")
    .eq("user_id", user.id)
    .in("course_id", courseIds)

  // Calculate progress for each course
  const coursesWithProgress = await Promise.all(
    (purchases || []).map(async (purchase: any) => {
      // Get total lessons
      const { count: totalLessons } = await supabase
        .from("course_lessons")
        .select("*", { count: "exact", head: true })
        .eq("course_id", purchase.course_id)

      // Get completed lessons
      const completedLessons = progressData?.filter((p) => p.course_id === purchase.course_id && p.is_completed).length

      return {
        ...purchase,
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        progressPercentage: totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0,
      }
    }),
  )

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">마이페이지</h1>
        <p className="text-muted-foreground">학습 현황과 계정 정보를 관리하세요</p>
      </div>

      <Tabs defaultValue="learning" className="space-y-6">
        <TabsList>
          <TabsTrigger value="learning">수강중인 강의</TabsTrigger>
          <TabsTrigger value="purchases">구매 내역</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="profile">프로필 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="learning">
          <div className="space-y-4">
            {coursesWithProgress && coursesWithProgress.length > 0 ? (
              coursesWithProgress.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="h-32 w-full overflow-hidden rounded-lg bg-muted md:w-48">
                        {item.course?.thumbnail_url ? (
                          <img
                            src={item.course.thumbnail_url || "/placeholder.svg"}
                            alt={item.course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            강의 이미지
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-bold">{item.course?.title}</h3>
                          <p className="mb-2 text-sm text-muted-foreground">{item.course?.instructor_name}</p>
                          <div className="mb-3">
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>진행률</span>
                              <span className="font-semibold">{item.progressPercentage}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${item.progressPercentage}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.completedLessons} / {item.totalLessons} 강의 완료
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild>
                            <Link href={`/course/${item.course?.slug}/learn`}>학습 계속하기</Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/course/${item.course?.slug}`}>강의 정보</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-muted-foreground">아직 수강중인 강의가 없습니다</p>
                  <Button asChild>
                    <Link href="/course">강의 둘러보기</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="space-y-4">
            {purchases && purchases.length > 0 ? (
              purchases.map((purchase: any) => (
                <Card key={purchase.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-24 w-32 overflow-hidden rounded-lg bg-muted">
                          {purchase.course?.thumbnail_url ? (
                            <img
                              src={purchase.course.thumbnail_url || "/placeholder.svg"}
                              alt={purchase.course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              강의 이미지
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="mb-1 font-bold">{purchase.course?.title}</h3>
                          <p className="mb-2 text-sm text-muted-foreground">{purchase.course?.instructor_name}</p>
                          <p className="text-xs text-muted-foreground">
                            구매일: {new Date(purchase.purchased_at).toLocaleDateString("ko-KR")}
                          </p>
                          <p className="text-xs text-muted-foreground">결제수단: {purchase.payment_method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-2">{purchase.status}</Badge>
                        <p className="text-lg font-bold">₩{purchase.amount_paid.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-muted-foreground">구매 내역이 없습니다</p>
                  <Button asChild>
                    <Link href="/course">강의 둘러보기</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className={notification.is_read ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <CardDescription>{notification.message}</CardDescription>
                      </div>
                      {!notification.is_read && <Badge variant="secondary">새 알림</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString("ko-KR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">알림이 없습니다</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings user={user} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
