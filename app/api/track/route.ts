import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    const body = await request.json()
    const {
      action_type,
      resource_type,
      resource_id,
      resource_slug,
      page_url,
      duration_seconds,
      metadata,
      session_id,
    } = body

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // activity_logs에 기록
    const { error } = await supabase.from("activity_logs").insert({
      user_id: user?.id || null,
      session_id: session_id || null,
      action_type,
      resource_type: resource_type || null,
      resource_id: resource_id || null,
      resource_slug: resource_slug || null,
      page_url: page_url || null,
      referrer: headersList.get("referer") || null,
      user_agent: headersList.get("user-agent") || null,
      duration_seconds: duration_seconds || 0,
      metadata: metadata || {},
    })

    if (error) {
      console.error("Activity log error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // page_view일 때 해당 리소스의 view_count 증가
    if (action_type === "page_view" && resource_type && resource_id) {
      const tableMap: Record<string, string> = {
        course: "courses",
        service: "services",
        product: "products",
        forum_post: "forum_posts",
      }

      const tableName = tableMap[resource_type]
      if (tableName) {
        // RPC 함수로 원자적 증가 (동시성 문제 방지)
        await supabase.rpc("increment_view_count", {
          p_table_name: tableName,
          p_row_id: resource_id,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
