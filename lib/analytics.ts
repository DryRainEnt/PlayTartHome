import { createClient } from "@/lib/supabase/server"

// 기간 계산 헬퍼
function getDateRange(period: "today" | "week" | "month" | "year") {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setDate(now.getDate() - 30)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return { startDate, endDate: now }
}

// KPI 데이터 조회
export async function getKPIStats() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 오늘 방문자
  const { count: todayVisitors } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("action_type", "page_view")
    .gte("created_at", today.toISOString())

  // 어제 방문자 (비교용)
  const { count: yesterdayVisitors } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("action_type", "page_view")
    .gte("created_at", yesterday.toISOString())
    .lt("created_at", today.toISOString())

  // 오늘 신규 가입
  const { count: todaySignups } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // 어제 신규 가입
  const { count: yesterdaySignups } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yesterday.toISOString())
    .lt("created_at", today.toISOString())

  // 총 사용자
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // 총 조회수
  const { count: totalPageViews } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("action_type", "page_view")

  return {
    todayVisitors: todayVisitors || 0,
    yesterdayVisitors: yesterdayVisitors || 0,
    visitorChange: yesterdayVisitors
      ? Math.round(((todayVisitors || 0) - yesterdayVisitors) / yesterdayVisitors * 100)
      : 0,
    todaySignups: todaySignups || 0,
    yesterdaySignups: yesterdaySignups || 0,
    signupChange: yesterdaySignups
      ? Math.round(((todaySignups || 0) - yesterdaySignups) / yesterdaySignups * 100)
      : 0,
    totalUsers: totalUsers || 0,
    totalPageViews: totalPageViews || 0,
  }
}

// 일별 트렌드 데이터
export async function getDailyTrend(days: number = 14) {
  const supabase = await createClient()
  const results: { date: string; visitors: number; pageViews: number; signups: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    // 페이지뷰
    const { count: pageViews } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("action_type", "page_view")
      .gte("created_at", date.toISOString())
      .lt("created_at", nextDate.toISOString())

    // 유니크 방문자 (session_id 또는 user_id 기준)
    const { data: visitorData } = await supabase
      .from("activity_logs")
      .select("user_id, session_id")
      .eq("action_type", "page_view")
      .gte("created_at", date.toISOString())
      .lt("created_at", nextDate.toISOString())

    const uniqueVisitors = new Set(
      visitorData?.map((v) => v.user_id || v.session_id) || []
    ).size

    // 신규 가입
    const { count: signups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", date.toISOString())
      .lt("created_at", nextDate.toISOString())

    results.push({
      date: date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      visitors: uniqueVisitors,
      pageViews: pageViews || 0,
      signups: signups || 0,
    })
  }

  return results
}

// 조회수 TOP 콘텐츠
export async function getTopViewedContent(limit: number = 10) {
  const supabase = await createClient()

  // 강의
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, view_count")
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(limit)

  // 서비스
  const { data: services } = await supabase
    .from("services")
    .select("id, title, slug, view_count")
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(limit)

  // 제품
  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, view_count")
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(limit)

  // 게시글
  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, title, view_count")
    .order("view_count", { ascending: false })
    .limit(limit)

  // 전체 합쳐서 정렬
  const all = [
    ...(courses?.map((c) => ({ ...c, type: "course" as const })) || []),
    ...(services?.map((s) => ({ ...s, type: "service" as const })) || []),
    ...(products?.map((p) => ({ ...p, type: "product" as const })) || []),
    ...(posts?.map((p) => ({ ...p, type: "forum_post" as const, slug: p.id })) || []),
  ]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, limit)

  return all
}

// 활성 사용자 분석
export async function getActiveUsers(days: number = 7) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // 활동 있는 사용자
  const { data: activeData } = await supabase
    .from("activity_logs")
    .select("user_id")
    .not("user_id", "is", null)
    .gte("created_at", startDate.toISOString())

  const uniqueActiveUsers = new Set(activeData?.map((a) => a.user_id) || []).size

  // 신규 가입자
  const { count: newUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate.toISOString())

  // 총 사용자
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  return {
    activeUsers: uniqueActiveUsers,
    newUsers: newUsers || 0,
    totalUsers: totalUsers || 0,
    activeRate: totalUsers ? Math.round((uniqueActiveUsers / totalUsers) * 100) : 0,
  }
}

// 인기 페이지 (activity_logs 기반)
export async function getPopularPages(limit: number = 10) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const { data } = await supabase
    .from("activity_logs")
    .select("page_url, resource_type, resource_slug")
    .eq("action_type", "page_view")
    .gte("created_at", startDate.toISOString())

  // URL별 카운트
  const urlCounts = new Map<string, number>()
  data?.forEach((log) => {
    const url = log.page_url || "unknown"
    urlCounts.set(url, (urlCounts.get(url) || 0) + 1)
  })

  return Array.from(urlCounts.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// 리소스 타입별 조회수 집계
export async function getViewsByResourceType() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("activity_logs")
    .select("resource_type")
    .eq("action_type", "page_view")
    .not("resource_type", "is", null)

  const typeCounts: Record<string, number> = {}
  data?.forEach((log) => {
    const type = log.resource_type || "other"
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    label: {
      course: "강의",
      service: "외주",
      product: "제품",
      forum_post: "게시글",
      page: "페이지",
    }[type] || type,
  }))
}

// 리소스 목록 조회 (타입별)
export async function getResourceList(resourceType: string) {
  const supabase = await createClient()

  switch (resourceType) {
    case "course": {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, view_count")
        .eq("is_published", true)
        .order("view_count", { ascending: false })
      return data?.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        viewCount: item.view_count || 0,
      })) || []
    }
    case "service": {
      const { data } = await supabase
        .from("services")
        .select("id, title, slug, view_count")
        .eq("is_published", true)
        .order("view_count", { ascending: false })
      return data?.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        viewCount: item.view_count || 0,
      })) || []
    }
    case "product": {
      const { data } = await supabase
        .from("products")
        .select("id, title, slug, view_count")
        .eq("is_published", true)
        .order("view_count", { ascending: false })
      return data?.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        viewCount: item.view_count || 0,
      })) || []
    }
    case "forum_post": {
      const { data } = await supabase
        .from("forum_posts")
        .select("id, title, view_count")
        .order("view_count", { ascending: false })
        .limit(50)
      return data?.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.id,
        viewCount: item.view_count || 0,
      })) || []
    }
    default:
      return []
  }
}

// 특정 리소스의 일별 트래픽 추이
export async function getResourceTrend(
  resourceType: string,
  resourceSlug: string,
  days: number = 14
): Promise<{ date: string; views: number }[]> {
  const supabase = await createClient()
  const results: { date: string; views: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const { count } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("action_type", "page_view")
      .eq("resource_type", resourceType)
      .eq("resource_slug", resourceSlug)
      .gte("created_at", date.toISOString())
      .lt("created_at", nextDate.toISOString())

    results.push({
      date: date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      views: count || 0,
    })
  }

  return results
}
