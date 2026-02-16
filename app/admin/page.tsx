import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BookOpen,
  Palette,
  Users,
  ShoppingCart,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Package,
} from "lucide-react"

async function getDashboardData() {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // 기본 카운트
  const [coursesRes, servicesRes, productsRes, usersRes, postsRes] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("forum_posts").select("*", { count: "exact", head: true }),
  ])
  const coursesCount = coursesRes.count ?? 0
  const servicesCount = servicesRes.count ?? 0
  const productsCount = productsRes.count ?? 0
  const usersCount = usersRes.count ?? 0
  const postsCount = postsRes.count ?? 0

  // 이번 달 매출
  const { data: thisMonthCourses } = await supabase
    .from("course_purchases")
    .select("amount_paid")
    .eq("status", "completed")
    .gte("purchased_at", monthStart.toISOString())

  const { data: thisMonthProducts } = await supabase
    .from("product_purchases")
    .select("amount_paid")
    .eq("status", "completed")
    .gte("created_at", monthStart.toISOString())

  const thisMonthRevenue =
    (thisMonthCourses?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0) +
    (thisMonthProducts?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0)

  // 지난 달 매출
  const { data: lastMonthCourses } = await supabase
    .from("course_purchases")
    .select("amount_paid")
    .eq("status", "completed")
    .gte("purchased_at", lastMonthStart.toISOString())
    .lt("purchased_at", monthStart.toISOString())

  const { data: lastMonthProducts } = await supabase
    .from("product_purchases")
    .select("amount_paid")
    .eq("status", "completed")
    .gte("created_at", lastMonthStart.toISOString())
    .lt("created_at", monthStart.toISOString())

  const lastMonthRevenue =
    (lastMonthCourses?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0) +
    (lastMonthProducts?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0)

  // 기간별 신규 가입
  const [todaySignupsRes, weekSignupsRes, monthSignupsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
  ])
  const todaySignups = todaySignupsRes.count ?? 0
  const weekSignups = weekSignupsRes.count ?? 0
  const monthSignups = monthSignupsRes.count ?? 0

  // 기간별 주문 수
  const [
    todayCourseOrdersRes, todayProductOrdersRes,
    weekCourseOrdersRes, weekProductOrdersRes,
    monthCourseOrdersRes, monthProductOrdersRes,
  ] = await Promise.all([
    supabase.from("course_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("purchased_at", todayStart.toISOString()),
    supabase.from("product_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", todayStart.toISOString()),
    supabase.from("course_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("purchased_at", weekStart.toISOString()),
    supabase.from("product_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", weekStart.toISOString()),
    supabase.from("course_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("purchased_at", monthStart.toISOString()),
    supabase.from("product_purchases").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", monthStart.toISOString()),
  ])
  const todayCourseOrders = todayCourseOrdersRes.count ?? 0
  const todayProductOrders = todayProductOrdersRes.count ?? 0
  const weekCourseOrders = weekCourseOrdersRes.count ?? 0
  const weekProductOrders = weekProductOrdersRes.count ?? 0
  const monthCourseOrders = monthCourseOrdersRes.count ?? 0
  const monthProductOrders = monthProductOrdersRes.count ?? 0

  // 최근 가입자 3명
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  // 최근 게시글 3개
  const { data: recentPosts } = await supabase
    .from("forum_posts")
    .select("id, title, created_at, author:profiles!forum_posts_author_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(3)

  return {
    counts: {
      courses: coursesCount,
      services: servicesCount,
      products: productsCount,
      users: usersCount,
      posts: postsCount,
    },
    revenue: {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      change: lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0 ? 100 : 0,
    },
    signups: {
      today: todaySignups,
      week: weekSignups,
      month: monthSignups,
    },
    orders: {
      today: todayCourseOrders + todayProductOrders,
      week: weekCourseOrders + weekProductOrders,
      month: monthCourseOrders + monthProductOrders,
    },
    recentUsers: recentUsers || [],
    recentPosts: recentPosts || [],
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const contentStats = [
    { label: "강의", value: data.counts.courses, icon: BookOpen, color: "text-blue-600", href: "/admin/courses" },
    { label: "외주 서비스", value: data.counts.services, icon: Palette, color: "text-purple-600", href: "/admin/services" },
    { label: "제품", value: data.counts.products, icon: Package, color: "text-teal-600", href: "/admin/products" },
    { label: "게시글", value: data.counts.posts, icon: FileText, color: "text-gray-600", href: "/admin/posts" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">사이트 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* 매출 & 사용자 현황 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 이번 달 매출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 매출
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{data.revenue.thisMonth.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {data.revenue.change > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{data.revenue.change}%</span>
                </>
              ) : data.revenue.change < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{data.revenue.change}%</span>
                </>
              ) : (
                <span>-</span>
              )}
              <span className="ml-1">지난 달 ₩{data.revenue.lastMonth.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* 총 사용자 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 사용자
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 +{data.signups.month}명
            </p>
          </CardContent>
        </Card>

        {/* 이번 달 주문 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 주문
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orders.month}</div>
            <p className="text-xs text-muted-foreground mt-1">
              오늘 {data.orders.today}건 · 이번 주 {data.orders.week}건
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 기간별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>기간별 현황</CardTitle>
          <CardDescription>신규 가입 및 주문 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">오늘</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">가입 {data.signups.today}명</p>
                <p className="text-lg font-semibold">주문 {data.orders.today}건</p>
              </div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">이번 주</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">가입 {data.signups.week}명</p>
                <p className="text-lg font-semibold">주문 {data.orders.week}건</p>
              </div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">이번 달</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">가입 {data.signups.month}명</p>
                <p className="text-lg font-semibold">주문 {data.orders.month}건</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 콘텐츠 현황 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 하단: 최근 활동 & 빠른 링크 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 최근 가입자 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 가입자</CardTitle>
              <CardDescription>최근 가입한 사용자</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                전체 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || "이름 없음"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                최근 가입자가 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* 최근 게시글 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 게시글</CardTitle>
              <CardDescription>최근 작성된 게시글</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">
                전체 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentPosts.length > 0 ? (
              <div className="space-y-3">
                {data.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {(post.author as any)?.full_name || "익명"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-2">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                최근 게시글이 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 링크 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 이동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                주문 관리
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                통계 분석
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/courses/new">
                <BookOpen className="mr-2 h-4 w-4" />
                새 강의 등록
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/services/new">
                <Palette className="mr-2 h-4 w-4" />
                새 서비스 등록
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
