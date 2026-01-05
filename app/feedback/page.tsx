import { FeedbackForm } from "@/components/feedback-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MessageSquare, Star, HelpCircle, BookOpen } from "lucide-react"

export default async function FeedbackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If logged in, fetch user's purchased courses for review
  let purchasedCourses: any[] = []
  if (user) {
    const { data } = await supabase
      .from("course_purchases")
      .select("*, course:courses(*)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    purchasedCourses = data || []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">고객센터</h1>
          <p className="text-muted-foreground">
            문의사항이나 의견을 보내주시면 빠르게 답변드리겠습니다
          </p>
        </div>

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">문의하기</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">수강 후기</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">자주 묻는 질문</span>
            </TabsTrigger>
          </TabsList>

          {/* Feedback Form Tab */}
          <TabsContent value="feedback">
            <FeedbackForm userId={user?.id} userEmail={user?.email} />
          </TabsContent>

          {/* Course Review Tab */}
          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  수강 후기 작성
                </CardTitle>
                <CardDescription>
                  수강하신 강의에 대한 솔직한 리뷰를 남겨주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      로그인 후 리뷰를 작성할 수 있습니다
                    </p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      로그인
                    </Link>
                  </div>
                ) : purchasedCourses.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      구매하신 강의가 없습니다
                    </p>
                    <Link
                      href="/course"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      강의 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      리뷰를 작성할 강의를 선택해주세요
                    </p>
                    {purchasedCourses.map((purchase) => (
                      <Link
                        key={purchase.id}
                        href={`/course/${purchase.course.slug}?review=true`}
                        className="block"
                      >
                        <Card className="transition-all hover:shadow-md hover:border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                {purchase.course.thumbnail_url ? (
                                  <img
                                    src={purchase.course.thumbnail_url}
                                    alt={purchase.course.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    강의
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold line-clamp-1">{purchase.course.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {purchase.course.instructor_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  구매일: {new Date(purchase.created_at).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                              <Star className="h-5 w-5 text-yellow-400 shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  자주 묻는 질문
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Q. 결제 후 강의는 어떻게 볼 수 있나요?</h3>
                    <p className="text-sm text-muted-foreground">
                      결제 완료 후 마이페이지 &gt; 내 강의에서 바로 수강하실 수 있습니다.
                      강의 접근 기간은 무제한입니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Q. 환불은 어떻게 진행되나요?</h3>
                    <p className="text-sm text-muted-foreground">
                      디지털 콘텐츠 특성상 수강 시작 후에는 환불이 제한됩니다.
                      수강 전 환불은 구매 후 7일 이내에 문의 주시면 처리해드립니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Q. 외주 서비스 신청은 어떻게 하나요?</h3>
                    <p className="text-sm text-muted-foreground">
                      외주 페이지에서 원하시는 서비스를 선택 후 문의하기 버튼을 통해
                      상담을 진행하실 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Q. 강사로 등록하고 싶어요.</h3>
                    <p className="text-sm text-muted-foreground">
                      강사 등록은 문의하기 탭에서 "기타"를 선택하시고 포트폴리오와 함께
                      지원해주시면 검토 후 연락드리겠습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Q. 커뮤니티 이용 규칙이 있나요?</h3>
                    <p className="text-sm text-muted-foreground">
                      타인을 비방하거나 광고성 게시물, 부적절한 콘텐츠는 삭제될 수 있습니다.
                      건전한 커뮤니티 문화를 위해 협조 부탁드립니다.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    원하시는 답변을 찾지 못하셨나요?{" "}
                    <button
                      onClick={() => {
                        const feedbackTab = document.querySelector('[value="feedback"]') as HTMLButtonElement
                        feedbackTab?.click()
                      }}
                      className="text-primary underline"
                    >
                      문의하기
                    </button>
                    를 이용해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
