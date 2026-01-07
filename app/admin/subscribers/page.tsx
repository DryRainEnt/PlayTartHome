import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Mail, Users, BookOpen, Palette, Newspaper } from "lucide-react"
import { EmailSendForm } from "./email-send-form"

const typeConfig = {
  new_course: { label: "새 강의", icon: BookOpen, color: "bg-blue-100 text-blue-800" },
  new_service: { label: "새 외주", icon: Palette, color: "bg-green-100 text-green-800" },
  newsletter: { label: "뉴스레터", icon: Newspaper, color: "bg-purple-100 text-purple-800" },
}

export default async function SubscribersPage() {
  const supabase = await createClient()

  // 구독자 목록 조회
  const { data: subscribers, error } = await supabase
    .from("email_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })

  // 디버깅용 로그
  if (error) {
    console.error("Subscribers fetch error:", error)
  }
  console.log("Subscribers count:", subscribers?.length, "Data:", subscribers)

  // 타입별 카운트
  const typeCounts = {
    new_course: subscribers?.filter((s) => s.subscription_type === "new_course" && s.is_active).length || 0,
    new_service: subscribers?.filter((s) => s.subscription_type === "new_service" && s.is_active).length || 0,
    newsletter: subscribers?.filter((s) => s.subscription_type === "newsletter" && s.is_active).length || 0,
  }

  const totalActive = subscribers?.filter((s) => s.is_active).length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">구독자 관리</h1>
        <p className="text-muted-foreground">이메일 알림 구독자 관리 및 발송</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 구독자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
            <p className="text-xs text-muted-foreground">활성 구독자</p>
          </CardContent>
        </Card>

        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeCounts[type as keyof typeof typeCounts]}
                </div>
                <p className="text-xs text-muted-foreground">구독자</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Email Send Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 발송
          </CardTitle>
          <CardDescription>
            구독자들에게 새 소식을 알려주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailSendForm typeCounts={typeCounts} />
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>구독자 목록</CardTitle>
          <CardDescription>
            총 {subscribers?.length || 0}명의 구독자
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscribers && subscribers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>구독 유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => {
                  const config = typeConfig[subscriber.subscription_type as keyof typeof typeConfig]
                  return (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {config && (
                          <Badge variant="secondary" className={config.color}>
                            {config.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {subscriber.is_active ? (
                          <Badge variant="default">활성</Badge>
                        ) : (
                          <Badge variant="outline">비활성</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(subscriber.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              아직 구독자가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
