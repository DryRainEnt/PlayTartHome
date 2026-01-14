import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageViewTracker } from "@/components/page-view-tracker"
import { CourseJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://play-t.art"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from("courses")
    .select("title, description, thumbnail_url, instructor_name, price")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!course) {
    return {
      title: "강의를 찾을 수 없습니다",
    }
  }

  const title = course.title
  const description = course.description || `${course.instructor_name} 강사의 ${course.title} 강의`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/course/${slug}`,
      type: "website",
      images: course.thumbnail_url ? [{ url: course.thumbnail_url, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: course.thumbnail_url ? [course.thumbnail_url] : undefined,
    },
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).eq("is_published", true).single()

  if (!course) {
    redirect("/course")
  }

  // Fetch sections and lessons
  const { data: sections } = await supabase
    .from("course_sections")
    .select(
      `
      *,
      lessons:course_lessons(*)
    `,
    )
    .eq("course_id", course.id)
    .order("order_index")

  // Check if user has purchased
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from("course_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("status", "completed")
      .single()

    hasPurchased = !!purchase
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseJsonLd
        name={course.title}
        description={course.description || ""}
        provider={course.instructor_name || "Playtart"}
        url={`/course/${slug}`}
        image={course.thumbnail_url}
        price={course.price}
      />
      <PageViewTracker resourceType="course" resourceId={course.id} resourceSlug={slug} />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Preview */}
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url || "/placeholder.svg"}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">강의 미리보기</div>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2">
            {course.level && <Badge>{course.level}</Badge>}
            {course.rating > 0 && (
              <span className="text-sm text-muted-foreground">
                ⭐ {course.rating.toFixed(1)} ({course.review_count}개 리뷰)
              </span>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
          <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

          <div className="mb-8 flex items-center gap-6 text-sm text-muted-foreground">
            <span>강사: {course.instructor_name}</span>
            {course.total_students > 0 && <span>{course.total_students}명 수강</span>}
            {course.duration_minutes && <span>{Math.floor(course.duration_minutes / 60)}시간</span>}
          </div>

          {/* Course Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>커리큘럼</CardTitle>
              <CardDescription>
                {sections?.length || 0}개 섹션 · {sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0}
                개 강의
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections?.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    <div className="space-y-1">
                      {section.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              {lesson.video_duration && (
                                <p className="text-xs text-muted-foreground">
                                  {Math.floor(lesson.video_duration / 60)}분
                                </p>
                              )}
                            </div>
                          </div>
                          {lesson.is_free && <Badge variant="secondary">무료</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="mb-6">
                {course.original_price && course.original_price > course.price && (
                  <p className="text-lg text-muted-foreground line-through">
                    ₩{course.original_price.toLocaleString()}
                  </p>
                )}
                <p className="text-3xl font-bold text-primary">₩{course.price.toLocaleString()}</p>
              </div>

              {hasPurchased ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/course/${slug}/learn`}>학습 시작하기</Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/course/${slug}/purchase`}>지금 구매하기</Link>
                </Button>
              )}

              <div className="mt-6 space-y-3 border-t pt-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>평생 수강 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>모바일 및 PC 접근</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>수료증 제공</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
