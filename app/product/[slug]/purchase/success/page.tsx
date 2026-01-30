import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckCircle, Download, User, Calendar, CreditCard, AlertCircle, Package } from "lucide-react"

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

export default async function ProductPurchaseSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    paymentKey?: string
    orderId?: string
    amount?: string
    productId?: string
    userId?: string
  }>
}) {
  const { slug } = await params
  const { paymentKey, orderId, amount, productId, userId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (!product) {
    redirect("/product")
  }

  let paymentError: string | null = null
  let purchase: any = null

  // 토스페이먼츠에서 리다이렉트된 경우 (유료 결제)
  if (paymentKey && orderId && amount) {
    const amountNumber = parseInt(amount, 10)

    // 이미 처리된 주문인지 확인
    const { data: existingPurchase } = await supabase
      .from("product_purchases")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (existingPurchase) {
      if (existingPurchase.status === "completed") {
        purchase = existingPurchase
      } else {
        paymentError = "이미 처리 중인 주문입니다"
      }
    } else {
      // 새 주문 - 토스페이먼츠 결제 승인
      const result = await confirmPayment(paymentKey, orderId, amountNumber)

      if (!result.ok) {
        paymentError = result.data.message || "결제 승인에 실패했습니다"
      } else {
        // 토스에서 승인된 실제 금액 사용 (URL 파라미터 조작 방지)
        const confirmedAmount = result.data.totalAmount

        // 제품 가격과 결제 금액 검증
        if (confirmedAmount !== product.price) {
          console.error("Amount mismatch:", { expected: product.price, confirmed: confirmedAmount })
          paymentError = "결제 금액이 제품 가격과 일치하지 않습니다"
        } else {
          // 결제 승인 성공 - 구매 기록 생성
          const { data: newPurchase, error: insertError } = await supabase
            .from("product_purchases")
            .insert({
              user_id: user.id,
              product_id: product.id,
              amount_paid: confirmedAmount,
              payment_method: result.data.method || "카드",
              status: "completed",
              order_id: orderId,
              payment_id: paymentKey,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Insert error:", insertError)
            paymentError = "구매 기록 저장에 실패했습니다"
          } else {
            purchase = newPurchase
          }
        }
      }
    }
  } else {
    // 쿼리 파라미터 없이 직접 접근한 경우 - 기존 완료된 구매 확인 (무료 포함)
    const { data: completedPurchase } = await supabase
      .from("product_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!completedPurchase) {
      redirect(`/product/${slug}/purchase`)
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
              <Link href={`/product/${slug}/purchase`}>다시 시도하기</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/product/${slug}`}>제품 페이지로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isFree = purchase?.amount_paid === 0

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg">
        {/* Success Icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">{isFree ? "다운로드 완료!" : "결제 완료!"}</h1>
          <p className="mt-2 text-muted-foreground">
            {isFree ? "제품을 무료로 받으셨습니다" : "제품 구매가 성공적으로 완료되었습니다"}
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">주문 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Info */}
            <div className="flex gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    제품
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                {product.file_format && (
                  <p className="text-sm text-muted-foreground">{product.file_format}</p>
                )}
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
                  {isFree ? "다운로드일시" : "결제일시"}
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
              {!isFree && purchase?.payment_method && (
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
              <span className="font-medium">{isFree ? "가격" : "결제 금액"}</span>
              <span className="text-xl font-bold text-primary">
                {isFree ? "무료" : `₩${(purchase?.amount_paid || product.price).toLocaleString()}`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {product.download_url && (
            <Button className="w-full" size="lg" asChild>
              <a href={product.download_url} download>
                <Download className="mr-2 h-5 w-5" />
                지금 바로 다운로드
              </a>
            </Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/my-page?tab=purchases">내 구매 목록</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/product">다른 제품 둘러보기</Link>
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isFree ? (
            "무료 제품을 받아주셔서 감사합니다!"
          ) : (
            <>
              결제 영수증은 등록된 이메일로 발송됩니다.<br />
              문의사항이 있으시면 고객센터로 연락해주세요.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
