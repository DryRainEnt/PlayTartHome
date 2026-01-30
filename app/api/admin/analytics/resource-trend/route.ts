import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getResourceTrend } from "@/lib/analytics"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get("type")
    const resourceSlug = searchParams.get("slug")
    const days = parseInt(searchParams.get("days") || "14", 10)

    if (!resourceType || !resourceSlug) {
      return NextResponse.json({ error: "type과 slug 파라미터가 필요합니다" }, { status: 400 })
    }

    const trend = await getResourceTrend(resourceType, resourceSlug, Math.min(days, 90))

    return NextResponse.json({ trend })
  } catch (error) {
    console.error("Resource trend API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
