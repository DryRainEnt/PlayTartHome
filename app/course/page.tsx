import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function CoursePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase.from("course_categories").select("*").order("created_at")

  // Build query
  let query = supabase.from("courses").select("*").eq("is_published", true)

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  const { data: courses } = await query.order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">강의</h1>
        <p className="text-muted-foreground">전문가가 만든 고품질 온라인 강의로 실력을 키우세요</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <Input placeholder="강의 검색..." className="md:max-w-md" />
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
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">강의를 찾을 수 없습니다</CardContent>
        </Card>
      )}
    </div>
  )
}
