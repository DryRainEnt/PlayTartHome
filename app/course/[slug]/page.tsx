import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageViewTracker } from "@/components/page-view-tracker"
import { CourseJsonLd } from "@/components/json-ld"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import { BookOpen, Clock, BarChart3, User } from "lucide-react"
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

  const totalLessons = sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0
  const totalDuration = sections?.reduce(
    (acc, s) => acc + (s.lessons?.reduce((a: number, l: any) => a + (l.video_duration || 0), 0) || 0),
    0
  ) || 0

  const levelLabel: Record<string, string> = {
    beginner: "입문",
    intermediate: "중급",
    advanced: "고급",
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
        <div className="lg:col-span-2 space-y-8">
          {/* Course Preview */}
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
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

          <div>
            <div className="mb-4 flex items-center gap-2">
              {course.level && <Badge>{levelLabel[course.level] || course.level}</Badge>}
              {course.rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  ⭐ {course.rating.toFixed(1)} ({course.review_count}개 리뷰)
                </span>
              )}
            </div>

            <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
            <div className="mb-6 text-lg text-muted-foreground prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>{course.description || ""}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>강사: {course.instructor_name}</span>
              {course.total_students > 0 && <span>{course.total_students}명 수강</span>}
              {totalDuration > 0 && <span>{Math.floor(totalDuration / 60)}시간 {totalDuration % 60}분</span>}
            </div>
          </div>

          {/* Course Content (Markdown) */}
          {course.content && (
            <Card>
              <CardHeader>
                <CardTitle>강의 소개</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>{course.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Curriculum with Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>커리큘럼</CardTitle>
              <CardDescription>
                {sections?.length || 0}개 섹션 · {totalLessons}개 강의
                {totalDuration > 0 && ` · 총 ${Math.floor(totalDuration / 60)}시간 ${totalDuration % 60}분`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sections && sections.length > 0 ? (
                <Accordion type="multiple" defaultValue={sections.map((s) => s.id)}>
                  {sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{section.title}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {section.lessons?.length || 0}개 강의
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1">
                          {section.lessons
                            ?.sort((a: any, b: any) => a.order_index - b.order_index)
                            .map((lesson: any) => {
                              const isComingSoon = lesson.is_published === false
                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center justify-between rounded-lg border p-3 ${
                                    isComingSoon ? "bg-muted/50 opacity-70" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {isComingSoon ? (
                                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    ) : (
                                      <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    )}
                                    <div>
                                      <p className={`text-sm font-medium ${isComingSoon ? "text-muted-foreground" : ""}`}>
                                        {lesson.title}
                                      </p>
                                      {isComingSoon ? (
                                        <p className="text-xs text-muted-foreground">추후 공개 예정</p>
                                      ) : lesson.video_duration ? (
                                        <p className="text-xs text-muted-foreground">
                                          {Math.floor(lesson.video_duration / 60)}분
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isComingSoon && <Badge variant="outline">공개 예정</Badge>}
                                    {!isComingSoon && lesson.is_free && <Badge variant="secondary">무료</Badge>}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-4">아직 커리큘럼이 준비되지 않았습니다</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-6">
              <div>
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
              ) : user ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/course/${slug}/purchase`}>지금 구매하기</Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/auth/login?redirect=/course/${slug}`}>로그인 후 구매</Link>
                </Button>
              )}

              {/* Course Features */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold text-sm">강의 포함 내용</h3>
                <div className="space-y-2 text-sm">
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{totalLessons}개 강의</span>
                    </div>
                  )}
                  {totalDuration > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>총 {Math.floor(totalDuration / 60)}시간 {totalDuration % 60}분</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>{levelLabel[course.level] || course.level}</span>
                    </div>
                  )}
                  {course.instructor_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{course.instructor_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
