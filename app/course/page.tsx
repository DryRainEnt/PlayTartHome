import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { EmailSubscriptionForm } from "@/components/email-subscription-form"
import { PageViewTracker } from "@/components/page-view-tracker"

const ITEMS_PER_PAGE = 9

export default async function CoursePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch categories
  const { data: categories } = await supabase.from("course_categories").select("*").order("created_at")

  // Build query
  let query = supabase.from("courses").select("*", { count: "exact" }).eq("is_published", true)

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  const { data: courses, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Get subscriber count for empty state
  const { data: subscriberCount } = await supabase
    .rpc("get_subscription_count", { sub_type: "new_course" })

  // Get user email if logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Build pagination URL
  const buildUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (params.category) urlParams.set("category", params.category)
    if (params.search) urlParams.set("search", params.search)
    urlParams.set("page", page.toString())
    return `/course?${urlParams.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">강의</h1>
        <p className="text-muted-foreground">전문가가 만든 고품질 온라인 강의로 실력을 키우세요</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <form action="/course" method="GET" className="relative md:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="강의 검색..."
            defaultValue={params.search || ""}
            className="pl-10"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button variant={!params.category ? "default" : "outline"} asChild>
            <Link href="/course">전체</Link>
          </Button>
          {categories?.map((category) => (
            <Button key={category.id} variant={params.category === category.slug ? "default" : "outline"} asChild>
              <Link href={`/course?category=${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      강의 이미지
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{course.level}</span>
                    {course.rating > 0 && (
                      <span className="text-xs text-muted-foreground">⭐ {course.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{course.instructor_name}</span>
                    <div className="text-right">
                      {course.original_price && course.original_price > course.price && (
                        <span className="mr-2 text-sm text-muted-foreground line-through">
                          ₩{course.original_price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-lg font-bold text-primary">₩{course.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : params.search || params.category ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            검색 결과가 없습니다
          </CardContent>
        </Card>
      ) : (
        <EmailSubscriptionForm
          type="new_course"
          userEmail={user?.email}
          subscriberCount={subscriberCount || 0}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage <= 1}
          >
            <Link href={buildUrl(currentPage - 1)} aria-disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
            .map((page, idx, arr) => (
              <span key={page} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  asChild
                >
                  <Link href={buildUrl(page)}>{page}</Link>
                </Button>
              </span>
            ))}

          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage >= totalPages}
          >
            <Link href={buildUrl(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <PageViewTracker pageName="course-list" />
    </div>
  )
}
