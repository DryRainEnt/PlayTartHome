"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { createClient } from "@/lib/supabase/client"
import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
import { Construction, Loader2, Download } from "lucide-react"
import Link from "next/link"

interface ProductPurchaseFormProps {
  product: any
  user: any
  profile: any
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""
const TOSS_ENABLED = process.env.NEXT_PUBLIC_TOSS_ENABLED === "true"

export function ProductPurchaseForm({ product, user, profile }: ProductPurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeRefund, setAgreeRefund] = useState(false)
  const [widgets, setWidgets] = useState<any>(null)
  const [isAgreementReady, setIsAgreementReady] = useState(false)
  const paymentMethodRef = useRef<HTMLDivElement>(null)
  const agreementRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 주문번호 생성
  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PD${dateStr}-${random}`
  }

  const [orderId] = useState(generateOrderId())

  // 무료 제품 처리
  const isFreeProduct = product.price === 0

  // 토스페이먼츠 결제위젯 초기화 (유료 제품만)
  useEffect(() => {
    if (isFreeProduct) {
      setIsInitializing(false)
      return
    }

    const initTossPayments = async () => {
      if (!TOSS_CLIENT_KEY || !TOSS_ENABLED) {
        setIsInitializing(false)
        return
      }

      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
        const customerKey = `customer_${user.id.replace(/-/g, "").substring(0, 20)}`

        // 결제위젯 인스턴스 생성
        const widgetsInstance = tossPayments.widgets({
          customerKey,
        })

        // 결제 금액 설정
        await widgetsInstance.setAmount({
          currency: "KRW",
          value: product.price,
        })

        setWidgets(widgetsInstance)
        setIsInitializing(false)
      } catch (err) {
        console.error("TossPayments init error:", err)
        setError("결제 시스템 초기화에 실패했습니다")
        setIsInitializing(false)
      }
    }

    initTossPayments()
  }, [user.id, isFreeProduct, product.price])

  // 위젯 렌더링 (유료 제품만)
  useEffect(() => {
    if (isFreeProduct || !widgets || !paymentMethodRef.current || !agreementRef.current) return

    const renderWidgets = async () => {
      try {
        // 결제수단 위젯 렌더링
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        })

        // 약관 동의 위젯 렌더링
        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        })

        setIsAgreementReady(true)
      } catch (err) {
        console.error("Widget render error:", err)
        setError("결제 위젯 로딩에 실패했습니다")
      }
    }

    renderWidgets()
  }, [widgets, isFreeProduct])

  // 무료 제품 받기 (서버사이드 검증)
  const handleFreePurchase = async () => {
    if (!agreeTerms || !agreeRefund) {
      setError("이용약관과 환불정책에 동의해주세요")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payment/free-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, orderId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "처리 중 오류가 발생했습니다")
      }

      // 성공 페이지로 이동
      window.location.href = `/product/${product.slug}/purchase/success`
    } catch (err: any) {
      console.error("Free purchase error:", err)
      setError(err.message || "처리 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  // 유료 제품 결제
  const handlePurchase = async () => {
    if (isFreeProduct) {
      await handleFreePurchase()
      return
    }

    if (!widgets) {
      setError("결제 시스템이 준비되지 않았습니다")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 결제위젯으로 결제 요청
      await widgets.requestPayment({
        orderId: orderId,
        orderName: product.title,
        successUrl: `${window.location.origin}/product/${product.slug}/purchase/success?productId=${product.id}&userId=${user.id}&amount=${product.price}`,
        failUrl: `${window.location.origin}/product/${product.slug}/purchase?error=payment_failed`,
        customerEmail: user.email,
        customerName: profile?.full_name || profile?.display_name || "고객",
      })
    } catch (err: any) {
      if (err.code === "USER_CANCEL" || err.code === "PAY_PROCESS_CANCELED") {
        setError("결제가 취소되었습니다")
      } else {
        console.error("Payment error:", err)
        setError(err.message || "결제 요청에 실패했습니다")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 결제 시스템 비활성화 상태 (유료 제품만)
  if (!isFreeProduct && !TOSS_ENABLED) {
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
                  <Link href={`/product/${product.slug}`}>제품 페이지로 돌아가기</Link>
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
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  제품 이미지
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{product.title}</h3>
              {product.file_format && (
                <p className="text-sm text-muted-foreground">포맷: {product.file_format}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {isFreeProduct ? "무료" : `₩${product.price.toLocaleString()}`}
              </p>
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

      {/* 결제수단 위젯 (유료만) */}
      {!isFreeProduct && (
        <Card>
          <CardHeader>
            <CardTitle>결제 수단</CardTitle>
            <CardDescription>
              결제에 사용할 수단을 선택해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div id="payment-method" ref={paymentMethodRef} />
          </CardContent>
        </Card>
      )}

      {/* 약관 동의 - 무료는 직접 체크박스, 유료는 위젯 */}
      {isFreeProduct ? (
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
                  디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한됩니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>약관 동의</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="agreement" ref={agreementRef} />
          </CardContent>
        </Card>
      )}

      {/* 최종 결제 금액 */}
      <Card>
        <CardHeader>
          <CardTitle>최종 결제 금액</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>제품 금액</span>
              <span>{isFreeProduct ? "무료" : `₩${product.price.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>총 결제 금액</span>
              <span className="text-primary">
                {isFreeProduct ? "무료" : `₩${product.price.toLocaleString()}`}
              </span>
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
          disabled={
            isLoading ||
            (!isFreeProduct && (!widgets || !isAgreementReady)) ||
            (isFreeProduct && (!agreeTerms || !agreeRefund))
          }
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : isFreeProduct ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              무료로 받기
            </>
          ) : (
            `₩${product.price.toLocaleString()} 결제하기`
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          위 내용을 확인하였으며, {isFreeProduct ? "다운로드에" : "결제에"} 동의합니다
        </p>
      </div>
    </div>
  )
}
