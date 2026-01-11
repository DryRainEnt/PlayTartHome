import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다" },
        { status: 400 }
      )
    }

    // 1. 토스페이먼츠 결제 승인 API 호출
    const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
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

    const paymentResult = await tossResponse.json()

    if (!tossResponse.ok) {
      console.error("TossPayments confirm error:", paymentResult)
      return NextResponse.json(
        { error: paymentResult.message || "결제 승인에 실패했습니다" },
        { status: 400 }
      )
    }

    // 2. DB 업데이트
    const supabase = await createClient()

    // 주문번호로 구매 기록 찾기
    const { data: purchase, error: findError } = await supabase
      .from("course_purchases")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (findError || !purchase) {
      console.error("Purchase not found:", findError)
      return NextResponse.json(
        { error: "구매 기록을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 금액 검증
    if (purchase.amount_paid !== amount) {
      console.error("Amount mismatch:", { expected: purchase.amount_paid, received: amount })
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다" },
        { status: 400 }
      )
    }

    // 결제 완료 상태로 업데이트
    const { error: updateError } = await supabase
      .from("course_purchases")
      .update({
        status: "completed",
        payment_id: paymentKey,
        payment_method: paymentResult.method || "card",
      })
      .eq("id", purchase.id)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "구매 기록 업데이트에 실패했습니다" },
        { status: 500 }
      )
    }

    // 3. 강의 수강생 수 증가 (선택적)
    await supabase.rpc("increment_student_count", {
      course_id: purchase.course_id,
    }).catch(() => {
      // RPC 함수가 없어도 에러 무시
    })

    return NextResponse.json({
      success: true,
      payment: {
        orderId: paymentResult.orderId,
        amount: paymentResult.totalAmount,
        method: paymentResult.method,
        approvedAt: paymentResult.approvedAt,
      },
    })
  } catch (error) {
    console.error("Payment confirm error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
