import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })
    }

    // Parse request body
    const { key, value } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: "key와 value가 필요합니다" }, { status: 400 })
    }

    if (!["general", "seo", "social"].includes(key)) {
      return NextResponse.json({ error: "유효하지 않은 설정 키입니다" }, { status: 400 })
    }

    // Upsert settings
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )

    if (error) {
      console.error("Settings update error:", error)
      return NextResponse.json({ error: "설정 저장에 실패했습니다" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
