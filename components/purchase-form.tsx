"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { createClient } from "@/lib/supabase/client"
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk"
import { Construction, Loader2 } from "lucide-react"
import Link from "next/link"

interface PurchaseFormProps {
  course: any
  user: any
  profile: any
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""
const TOSS_ENABLED = process.env.NEXT_PUBLIC_TOSS_ENABLED === "true"

export function PurchaseForm({ course, user, profile }: PurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeRefund, setAgreeRefund] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const supabase = createClient()

  // 주문번호 생성
  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PT${dateStr}-${random}`
  }

  const [orderId] = useState(generateOrderId())

  // 토스페이먼츠 SDK 초기화 (API 개별 연동 방식)
  useEffect(() => {
    const initTossPayments = async () => {
      if (!TOSS_CLIENT_KEY || !TOSS_ENABLED) {
        setIsInitializing(false)
        return
      }

      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
        const customerKey = `customer_${user.id.replace(/-/g, "").substring(0, 20)}`

        // API 개별 연동 방식: payment() 사용
        const paymentInstance = tossPayments.payment({
          customerKey,
        })

        setPayment(paymentInstance)
        setIsInitializing(false)
      } catch (err) {
        console.error("TossPayments init error:", err)
        setError("결제 시스템 초기화에 실패했습니다")
        setIsInitializing(false)
      }
    }

    initTossPayments()
  }, [user.id])

  const handlePurchase = async () => {
    if (!payment) {
      setError("결제 시스템이 준비되지 않았습니다")
      return
    }

    // 약관 동의 확인
    if (!agreeTerms || !agreeRefund) {
      setError("이용약관과 환불정책에 동의해주세요")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. DB에 pending 상태로 구매 기록 생성
      const { data: purchase, error: purchaseError } = await supabase
        .from("course_purchases")
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount_paid: course.price,
          payment_method: "카드",
          status: "pending",
          order_id: orderId,
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // 2. 토스페이먼츠 결제 요청 (API 개별 연동 - 카드/간편결제 통합결제창)
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: course.price,
        },
        orderId: orderId,
        orderName: course.title,
        successUrl: `${window.location.origin}/course/${course.slug}/purchase/success`,
        failUrl: `${window.location.origin}/course/${course.slug}/purchase?error=payment_failed`,
        customerEmail: user.email,
        customerName: profile?.full_name || profile?.display_name || "고객",
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      })
    } catch (err: any) {
      // 사용자가 결제창을 닫은 경우
      if (err.code === "USER_CANCEL" || err.code === "PAY_PROCESS_CANCELED") {
        setError("결제가 취소되었습니다")
      } else {
        console.error("Payment error:", err)
        setError(err instanceof Error ? err.message : "결제 요청에 실패했습니다")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 결제 시스템 비활성화 상태
  if (!TOSS_ENABLED) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Construction className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">결제 시스템 준비 중</h2>
                <p className="mt-2 text-muted-foreground">
                  결제 시스템을 준비하고 있습니다.<br />
                  빠른 시일 내에 오픈할 예정이니 조금만 기다려주세요!
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/course/${course.slug}`}>강의 페이지로 돌아가기</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // SDK 초기화 중
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">결제 시스템 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 주문 상품 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 상품</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  강의 이미지
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₩{course.price.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 구매자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>구매자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">이름</span>
              <span className="font-medium">{profile?.full_name || profile?.display_name || "미설정"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결제 방법 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 방법</CardTitle>
          <CardDescription>
            결제하기 버튼을 누르면 토스페이먼츠 결제창이 열립니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p>지원 결제수단: 신용/체크카드, 간편결제(토스페이, 카카오페이, 네이버페이 등)</p>
          </div>
        </CardContent>
      </Card>

      {/* 서비스 약관 동의 */}
      <Card>
        <CardHeader>
          <CardTitle>약관 동의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agreeTerms" className="cursor-pointer font-medium">
                이용약관 동의 (필수)
              </Label>
              <p className="text-sm text-muted-foreground">
                서비스 이용약관에 동의합니다
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeRefund"
              checked={agreeRefund}
              onCheckedChange={(checked) => setAgreeRefund(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agreeRefund" className="cursor-pointer font-medium">
                환불정책 동의 (필수)
              </Label>
              <p className="text-sm text-muted-foreground">
                디지털 콘텐츠 특성상 수강 시작 후에는 환불이 제한됩니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최종 결제 금액 */}
      <Card>
        <CardHeader>
          <CardTitle>최종 결제 금액</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>강의 금액</span>
              <span>₩{course.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>총 결제 금액</span>
              <span className="text-primary">₩{course.price.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handlePurchase}
          disabled={isLoading || !payment || !agreeTerms || !agreeRefund}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              결제 진행 중...
            </>
          ) : (
            `₩${course.price.toLocaleString()} 결제하기`
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          위 내용을 확인하였으며, 결제에 동의합니다
        </p>
      </div>
    </div>
  )
}
