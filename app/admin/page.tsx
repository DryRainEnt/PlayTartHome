import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Palette, Users, ShoppingCart, MessageSquare, FileText } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: coursesCount },
    { count: servicesCount },
    { count: usersCount },
    { count: coursePurchasesCount },
    { count: productPurchasesCount },
    { count: postsCount },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("course_purchases").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("product_purchases").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("forum_posts").select("*", { count: "exact", head: true }),
  ])

  const ordersCount = (coursePurchasesCount || 0) + (productPurchasesCount || 0)

  // Recent orders (강의 + 제품 구매 합쳐서)
  const { data: recentCoursePurchases } = await supabase
    .from("course_purchases")
    .select("*, user:profiles!course_purchases_user_id_fkey(full_name, email), course:courses(title)")
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .limit(5)

  const { data: recentProductPurchases } = await supabase
    .from("product_purchases")
    .select("*, user:profiles!product_purchases_user_id_fkey(full_name, email), product:products(title)")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5)

  // 두 구매 목록 합치고 최신순 정렬 (각 테이블의 날짜 컬럼명이 다름)
  const recentOrders = [
    ...(recentCoursePurchases || []).map(p => ({ ...p, type: "course", title: p.course?.title, order_date: p.purchased_at })),
    ...(recentProductPurchases || []).map(p => ({ ...p, type: "product", title: p.product?.title, order_date: p.created_at })),
  ]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5)

  const stats = [
    { label: "전체 강의", value: coursesCount || 0, icon: BookOpen, color: "text-blue-600" },
    { label: "외주 서비스", value: servicesCount || 0, icon: Palette, color: "text-purple-600" },
    { label: "가입 사용자", value: usersCount || 0, icon: Users, color: "text-green-600" },
    { label: "주문 수", value: ordersCount || 0, icon: ShoppingCart, color: "text-orange-600" },
    { label: "게시글", value: postsCount || 0, icon: FileText, color: "text-gray-600" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">사이트 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
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
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
          <CardDescription>최근 5개의 주문 내역입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{order.user?.full_name || order.user?.email || "알 수 없음"}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.title} ({order.type === "course" ? "강의" : "제품"})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.order_date).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{order.amount_paid?.toLocaleString()}</p>
                    <p className="text-sm text-green-600">완료</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              아직 주문이 없습니다
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
