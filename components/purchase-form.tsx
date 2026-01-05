"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Checkbox } from "./ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PurchaseFormProps {
  course: any
  user: any
  profile: any
}

export function PurchaseForm({ course, user, profile }: PurchaseFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeRefund, setAgreeRefund] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 주문번호 생성
  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PT${dateStr}-${random}`
  }

  const handlePurchase = async () => {
    // 동의 확인
    if (!agreeTerms || !agreeRefund) {
      setError("이용약관과 환불정책에 동의해주세요")
      return
    }

    setIsLoading(true)
    setError(null)

    const orderId = generateOrderId()

    try {
      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from("course_purchases")
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount_paid: course.price,
          payment_method: paymentMethod,
          status: "pending",
          order_id: orderId,
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // TODO: 토스페이먼츠 연동 시 여기서 결제창 호출
      // const tossPayments = await loadTossPayments(clientKey)
      // await tossPayments.requestPayment(paymentMethod, { ... })

      // 현재는 모의 결제 처리
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update purchase status
      const { error: updateError } = await supabase
        .from("course_purchases")
        .update({
          status: "completed",
          payment_id: `MOCK_${Date.now()}`,
        })
        .eq("id", purchase.id)

      if (updateError) throw updateError

      // Redirect to success page
      router.push(`/course/${course.slug}/purchase/success`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>결제 방법</CardTitle>
          <CardDescription>원하시는 결제 방법을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="kakaopay" id="kakaopay" />
                <Label htmlFor="kakaopay" className="flex flex-1 cursor-pointer items-center gap-2">
                  <span className="text-lg">💛</span>
                  <span className="font-medium">카카오페이</span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="tosspay" id="tosspay" />
                <Label htmlFor="tosspay" className="flex flex-1 cursor-pointer items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="font-medium">토스페이</span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="naverpay" id="naverpay" />
                <Label htmlFor="naverpay" className="flex flex-1 cursor-pointer items-center gap-2">
                  <span className="text-lg">💚</span>
                  <span className="font-medium">네이버페이</span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="font-medium">신용카드</span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex flex-1 cursor-pointer items-center gap-2">
                  <span className="text-lg">🏦</span>
                  <span className="font-medium">무통장입금</span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

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

      {/* 약관 동의 */}
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

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handlePurchase}
          disabled={isLoading || !agreeTerms || !agreeRefund}
          className="w-full"
          size="lg"
        >
          {isLoading ? "결제 진행 중..." : `₩${course.price.toLocaleString()} 결제하기`}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          위 내용을 확인하였으며, 결제에 동의합니다
        </p>
      </div>
    </div>
  )
}
