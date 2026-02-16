import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getKPIStats,
  getDailyTrend,
  getTopViewedContent,
  getActiveUsers,
  getViewsByResourceType,
} from "@/lib/analytics"
import { TrendingUp, TrendingDown, Users, Eye, UserPlus, Activity } from "lucide-react"
import { VisitorChart } from "./components/visitor-chart"
import { TopContentTable } from "./components/top-content-table"
import { ResourceTypeChart } from "./components/resource-type-chart"
import { DateRangeSelector } from "./components/date-range-selector"
import { ResourceTraffic } from "./components/resource-traffic"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const resolvedParams = await searchParams
  const days = Math.min(Math.max(parseInt(resolvedParams.days || "14", 10), 7), 90)

  const defaultKPI = {
    todayVisitors: 0, yesterdayVisitors: 0, visitorChange: 0,
    todaySignups: 0, yesterdaySignups: 0, signupChange: 0,
    totalUsers: 0, totalPageViews: 0,
  }
  const defaultActiveUsers = { activeUsers: 0, activeRate: 0, newUsers: 0, totalUsers: 0 }

  const [kpi, dailyTrend, topContent, activeUsers, resourceViews] = await Promise.all([
    getKPIStats().catch(() => defaultKPI),
    getDailyTrend(days).catch(() => []),
    getTopViewedContent(10).catch(() => []),
    getActiveUsers(7).catch(() => defaultActiveUsers),
    getViewsByResourceType().catch(() => []),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">통계 분석</h1>
          <p className="text-muted-foreground">사이트 방문자 및 콘텐츠 분석</p>
        </div>
        <DateRangeSelector />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 방문자</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.todayVisitors.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {kpi.visitorChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{kpi.visitorChange}%</span>
                </>
              ) : kpi.visitorChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpi.visitorChange}%</span>
                </>
              ) : (
                <span>전일 대비</span>
              )}
              <span className="ml-1">어제 {kpi.yesterdayVisitors}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 신규 가입</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.todaySignups}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {kpi.signupChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{kpi.signupChange}%</span>
                </>
              ) : kpi.signupChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpi.signupChange}%</span>
                </>
              ) : (
                <span>전일 대비</span>
              )}
              <span className="ml-1">어제 {kpi.yesterdaySignups}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              최근 7일 활동 ({activeUsers.activeRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              총 {kpi.totalPageViews.toLocaleString()} 페이지뷰
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>방문자 추이</CardTitle>
            <CardDescription>최근 {days}일 방문자 및 페이지뷰</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart data={dailyTrend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>콘텐츠별 조회</CardTitle>
            <CardDescription>리소스 타입별 조회 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceTypeChart data={resourceViews} />
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Tabs defaultValue="top-content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top-content">조회수 TOP 10</TabsTrigger>
          <TabsTrigger value="resource-traffic">상세 트래픽</TabsTrigger>
          <TabsTrigger value="users">사용자 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="top-content">
          <Card>
            <CardHeader>
              <CardTitle>인기 콘텐츠</CardTitle>
              <CardDescription>조회수 기준 상위 10개 콘텐츠</CardDescription>
            </CardHeader>
            <CardContent>
              <TopContentTable data={topContent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource-traffic">
          <Card>
            <CardHeader>
              <CardTitle>리소스별 트래픽</CardTitle>
              <CardDescription>개별 콘텐츠의 일별 조회수 추이를 확인합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceTraffic />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>사용자 통계</CardTitle>
              <CardDescription>최근 7일 사용자 활동 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">활성 사용자</p>
                  <p className="text-3xl font-bold">{activeUsers.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">
                    전체의 {activeUsers.activeRate}%
                  </p>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">신규 가입</p>
                  <p className="text-3xl font-bold">{activeUsers.newUsers}</p>
                  <p className="text-xs text-muted-foreground">최근 7일</p>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">전체 사용자</p>
                  <p className="text-3xl font-bold">{activeUsers.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">누적</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
