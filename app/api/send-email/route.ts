import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Resend 인스턴스는 요청 시점에 생성
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 관리자 권한 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { subject, content, subscriptionType } = body

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
    }

    // 구독자 목록 조회
    let query = supabase
      .from("email_subscriptions")
      .select("email")
      .eq("is_active", true)

    if (subscriptionType && subscriptionType !== "all") {
      query = query.eq("subscription_type", subscriptionType)
    }

    const { data: subscribers, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No subscribers found" }, { status: 404 })
    }

    // 중복 이메일 제거
    const uniqueEmails = [...new Set(subscribers.map((s) => s.email))]

    // 이메일 발송 (배치로 처리)
    const resend = getResend()
    const results = []
    const batchSize = 50 // Resend 배치 제한

    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize)

      const { data, error } = await resend.emails.send({
        from: "Playtart <noreply@play-t.art>",
        to: batch,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #F7B100; margin: 0;">Playtart</h1>
            </div>
            <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
              ${content.replace(/\n/g, "<br>")}
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                이 메일은 Playtart 알림 수신에 동의하신 분께 발송되었습니다.<br>
                <a href="https://play-t.art" style="color: #F7B100;">play-t.art</a>
              </p>
              <p style="font-size: 11px; color: #999;">
                플레이타르트 | 서울특별시 성북구 장위로19길 25, 2동 403호
              </p>
            </div>
          </body>
          </html>
        `,
      })

      if (error) {
        results.push({ batch: i / batchSize + 1, error: error.message })
      } else {
        results.push({ batch: i / batchSize + 1, success: true, id: data?.id })
      }
    }

    return NextResponse.json({
      success: true,
      totalSent: uniqueEmails.length,
      results,
    })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
