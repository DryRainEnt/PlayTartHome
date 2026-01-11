import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckCircle, Play, User, Calendar, CreditCard, AlertCircle } from "lucide-react"

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || ""

async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")

  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encryptedSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  })

  return {
    ok: response.ok,
    data: await response.json(),
  }
}

export default async function PurchaseSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>
}) {
  const { slug } = await params
  const { paymentKey, orderId, amount } = await searchParams
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

  let paymentError: string | null = null
  let purchase: any = null

  // 토스페이먼츠에서 리다이렉트된 경우 (쿼리 파라미터 존재)
  if (paymentKey && orderId && amount) {
    const amountNumber = parseInt(amount, 10)

    // 1. 먼저 pending 상태의 구매 기록 확인
    const { data: pendingPurchase } = await supabase
      .from("course_purchases")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .single()

    if (!pendingPurchase) {
      // 이미 처리된 주문인지 확인
      const { data: existingPurchase } = await supabase
        .from("course_purchases")
        .select("*")
        .eq("order_id", orderId)
        .eq("status", "completed")
        .single()

      if (existingPurchase) {
        // 이미 완료된 주문 - 정상 표시
        purchase = existingPurchase
      } else {
        paymentError = "구매 기록을 찾을 수 없습니다"
      }
    } else {
      // 금액 검증
      if (pendingPurchase.amount_paid !== amountNumber) {
        paymentError = "결제 금액이 일치하지 않습니다"
      } else {
        // 2. 토스페이먼츠 결제 승인
        const result = await confirmPayment(paymentKey, orderId, amountNumber)

        if (!result.ok) {
          paymentError = result.data.message || "결제 승인에 실패했습니다"

          // 결제 실패 시 상태 업데이트
          await supabase
            .from("course_purchases")
            .update({ status: "failed" })
            .eq("id", pendingPurchase.id)
        } else {
          // 3. 결제 완료 상태로 업데이트
          const { data: updatedPurchase, error: updateError } = await supabase
            .from("course_purchases")
            .update({
              status: "completed",
              payment_id: paymentKey,
              payment_method: result.data.method || "card",
            })
            .eq("id", pendingPurchase.id)
            .select()
            .single()

          if (updateError) {
            paymentError = "구매 기록 업데이트에 실패했습니다"
          } else {
            purchase = updatedPurchase
          }
        }
      }
    }
  } else {
    // 쿼리 파라미터 없이 직접 접근한 경우 - 기존 완료된 구매 확인
    const { data: completedPurchase } = await supabase
      .from("course_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("status", "completed")
      .order("purchased_at", { ascending: false })
      .limit(1)
      .single()

    if (!completedPurchase) {
      redirect(`/course/${slug}/purchase`)
    }

    purchase = completedPurchase
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 결제 실패 화면
  if (paymentError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold">결제 실패</h1>
            <p className="mt-2 text-muted-foreground">{paymentError}</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" asChild>
              <Link href={`/course/${slug}/purchase`}>다시 시도하기</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/course/${slug}`}>강의 페이지로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </div>
    )
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
                  {purchase?.purchased_at ? formatDate(purchase.purchased_at) : formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  구매자
                </span>
                <span className="font-medium">{user.email}</span>
              </div>
              {purchase?.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    결제수단
                  </span>
                  <span className="font-medium">{purchase.payment_method}</span>
                </div>
              )}
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
