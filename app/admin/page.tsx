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
    { count: ordersCount },
    { count: postsCount },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
  ])

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, user:profiles!orders_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(5)

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
                    <p className="font-medium">{order.user?.full_name || order.user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{order.total_amount?.toLocaleString()}</p>
                    <p className={`text-sm ${
                      order.status === "completed" ? "text-green-600" :
                      order.status === "pending" ? "text-yellow-600" :
                      "text-gray-600"
                    }`}>
                      {order.status === "completed" ? "완료" :
                       order.status === "pending" ? "대기" :
                       order.status}
                    </p>
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
