import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageCircle, Inbox, Clock } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch conversations where user is client or provider
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      service:services(title, slug),
      client:profiles!conversations_client_id_fkey(full_name, display_name),
      provider:profiles!conversations_provider_id_fkey(full_name, display_name),
      messages(id, content, sender_id, created_at, is_read)
    `)
    .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString("ko-KR")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">진행중</Badge>
      case "closed":
        return <Badge variant="secondary">종료</Badge>
      case "accepted":
        return <Badge className="bg-green-500">수락됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold flex items-center gap-3">
            <MessageCircle className="h-8 w-8" />
            메시지
          </h1>
          <p className="text-muted-foreground">서비스 문의 및 대화 내역</p>
        </div>

        {conversations && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const isClient = conv.client_id === user.id
              const otherParty = isClient ? conv.provider : conv.client
              const lastMessage = conv.messages?.[conv.messages.length - 1]
              const unreadCount = conv.messages?.filter(
                (m: any) => !m.is_read && m.sender_id !== user.id
              ).length || 0

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar placeholder */}
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <MessageCircle className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{conv.subject}</h3>
                            {getStatusBadge(conv.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {isClient ? "받는 사람: " : "보낸 사람: "}
                            {otherParty?.display_name || otherParty?.full_name || "알 수 없음"}
                          </p>
                          {conv.service && (
                            <p className="text-xs text-muted-foreground">
                              서비스: {conv.service.title}
                            </p>
                          )}
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {lastMessage.content.substring(0, 50)}...
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(conv.updated_at)}
                          </div>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount} 새 메시지
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">메시지가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                외주 서비스에 문의하면 여기에 대화가 표시됩니다
              </p>
              <Link
                href="/outsourcing"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                서비스 둘러보기
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
