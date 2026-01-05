import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckCircle, Play, User, Calendar, CreditCard } from "lucide-react"

export default async function PurchaseSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    redirect("/course")
  }

  // Get the latest purchase for this course
  const { data: purchase } = await supabase
    .from("course_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg">
        {/* Success Icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">결제 완료!</h1>
          <p className="mt-2 text-muted-foreground">강의 구매가 성공적으로 완료되었습니다</p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">주문 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Info */}
            <div className="flex gap-4">
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    강의
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
              </div>
            </div>

            <Separator />

            {/* Order Details */}
            <div className="space-y-3 text-sm">
              {purchase?.order_id && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    주문번호
                  </span>
                  <span className="font-mono font-medium">{purchase.order_id}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  결제일시
                </span>
                <span className="font-medium">
                  {purchase?.created_at ? formatDate(purchase.created_at) : formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  구매자
                </span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>

            <Separator />

            {/* Payment Amount */}
            <div className="flex items-center justify-between">
              <span className="font-medium">결제 금액</span>
              <span className="text-xl font-bold text-primary">
                ₩{(purchase?.amount_paid || course.price).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href={`/course/${slug}/learn`}>
              <Play className="mr-2 h-5 w-5" />
              지금 바로 학습 시작하기
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/my-page?tab=courses">내 강의 목록</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/course">다른 강의 둘러보기</Link>
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          결제 영수증은 등록된 이메일로 발송됩니다.<br />
          문의사항이 있으시면 고객센터로 연락해주세요.
        </p>
      </div>
    </div>
  )
}
