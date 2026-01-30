import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OrderFilters } from "./order-filters"

const ITEMS_PER_PAGE = 10

interface OrdersPageProps {
  searchParams: Promise<{
    type?: string
    period?: string
    page?: string
    search?: string
  }>
}

async function getOrders(params: {
  type: string
  period: string
  page: number
  search: string
}) {
  const supabase = await createClient()
  const { type, period, page, search } = params

  // 기간 계산
  let startDate: Date | null = null
  const now = new Date()

  switch (period) {
    case "7":
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
      break
    case "30":
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 30)
      break
    case "90":
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 90)
      break
    // "all"은 startDate가 null
  }

  const offset = (page - 1) * ITEMS_PER_PAGE

  // 강의 구매 조회
  let courseOrders: any[] = []
  let courseCount = 0

  if (type === "all" || type === "course") {
    let courseQuery = supabase
      .from("course_purchases")
      .select("*, user:profiles!course_purchases_user_id_fkey(full_name, email), course:courses(title, slug)", { count: "exact" })
      .eq("status", "completed")
      .order("purchased_at", { ascending: false })

    if (startDate) {
      courseQuery = courseQuery.gte("purchased_at", startDate.toISOString())
    }

    if (search) {
      // 검색은 join된 테이블에서 직접 필터링이 어려우므로 나중에 필터링
    }

    const { data, count } = await courseQuery

    courseOrders = (data || []).map((order) => ({
      id: order.id,
      orderId: order.order_id,
      type: "course" as const,
      title: order.course?.title || "삭제된 강의",
      slug: order.course?.slug,
      userName: order.user?.full_name || order.user?.email || "알 수 없음",
      userEmail: order.user?.email,
      amount: order.amount_paid,
      status: order.status,
      date: order.purchased_at,
    }))
    courseCount = count || 0
  }

  // 제품 구매 조회
  let productOrders: any[] = []
  let productCount = 0

  if (type === "all" || type === "product") {
    let productQuery = supabase
      .from("product_purchases")
      .select("*, user:profiles!product_purchases_user_id_fkey(full_name, email), product:products(title, slug)", { count: "exact" })
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    if (startDate) {
      productQuery = productQuery.gte("created_at", startDate.toISOString())
    }

    const { data, count } = await productQuery

    productOrders = (data || []).map((order) => ({
      id: order.id,
      orderId: order.order_id,
      type: "product" as const,
      title: order.product?.title || "삭제된 제품",
      slug: order.product?.slug,
      userName: order.user?.full_name || order.user?.email || "알 수 없음",
      userEmail: order.user?.email,
      amount: order.amount_paid,
      status: order.status,
      date: order.created_at,
    }))
    productCount = count || 0
  }

  // 합치고 정렬
  let allOrders = [...courseOrders, ...productOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 검색 필터
  if (search) {
    const searchLower = search.toLowerCase()
    allOrders = allOrders.filter(
      (order) =>
        order.title.toLowerCase().includes(searchLower) ||
        order.userName.toLowerCase().includes(searchLower) ||
        order.userEmail?.toLowerCase().includes(searchLower) ||
        order.orderId?.toLowerCase().includes(searchLower)
    )
  }

  const totalCount = allOrders.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // 페이지네이션
  const paginatedOrders = allOrders.slice(offset, offset + ITEMS_PER_PAGE)

  // 총 매출 계산
  const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0)

  return {
    orders: paginatedOrders,
    totalCount,
    totalPages,
    currentPage: page,
    totalRevenue,
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedParams = await searchParams
  const type = resolvedParams.type || "all"
  const period = resolvedParams.period || "30"
  const page = parseInt(resolvedParams.page || "1", 10)
  const search = resolvedParams.search || ""

  const data = await getOrders({ type, period, page, search })

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (type !== "all") params.set("type", type)
    if (period !== "30") params.set("period", period)
    if (newPage !== 1) params.set("page", String(newPage))
    if (search) params.set("search", search)
    const queryString = params.toString()
    return `/admin/orders${queryString ? `?${queryString}` : ""}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">주문 관리</h1>
        <p className="text-muted-foreground">주문 내역을 조회하고 관리합니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              조회된 주문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCount}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 매출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{data.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <OrderFilters
        currentType={type}
        currentPeriod={period}
        currentSearch={search}
      />

      {/* 주문 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 목록</CardTitle>
          <CardDescription>
            {data.totalCount}개의 주문 중 {(page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, data.totalCount)}번째
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.orders.length > 0 ? (
            <div className="space-y-4">
              {/* 테이블 헤더 */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>주문번호</div>
                <div>상품</div>
                <div>주문자</div>
                <div>금액</div>
                <div>날짜</div>
                <div>상태</div>
              </div>

              {/* 주문 목록 */}
              {data.orders.map((order) => (
                <div
                  key={`${order.type}-${order.id}`}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 py-3 border-b last:border-0"
                >
                  <div className="md:hidden text-xs text-muted-foreground">주문번호</div>
                  <div className="font-mono text-sm">
                    {order.orderId?.slice(0, 12) || order.id.slice(0, 8)}...
                  </div>

                  <div className="md:hidden text-xs text-muted-foreground mt-2">상품</div>
                  <div>
                    <p className="font-medium truncate">{order.title}</p>
                    <Badge variant="outline" className="mt-1">
                      {order.type === "course" ? "강의" : "제품"}
                    </Badge>
                  </div>

                  <div className="md:hidden text-xs text-muted-foreground mt-2">주문자</div>
                  <div>
                    <p className="font-medium">{order.userName}</p>
                    <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                  </div>

                  <div className="md:hidden text-xs text-muted-foreground mt-2">금액</div>
                  <div className="font-medium">
                    ₩{order.amount?.toLocaleString() || 0}
                  </div>

                  <div className="md:hidden text-xs text-muted-foreground mt-2">날짜</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("ko-KR")}
                  </div>

                  <div className="md:hidden text-xs text-muted-foreground mt-2">상태</div>
                  <div>
                    <Badge
                      variant={order.status === "completed" ? "default" : "secondary"}
                      className={order.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                    >
                      {order.status === "completed" ? "완료" : order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              조건에 맞는 주문이 없습니다
            </div>
          )}

          {/* 페이지네이션 */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={buildUrl(page - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </Link>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </>
                )}
              </Button>

              <span className="text-sm text-muted-foreground px-4">
                {page} / {data.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                asChild={page < data.totalPages}
              >
                {page < data.totalPages ? (
                  <Link href={buildUrl(page + 1)}>
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <>
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
