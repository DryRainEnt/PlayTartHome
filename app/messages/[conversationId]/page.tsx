import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      *,
      service:services(title, slug),
      client:profiles!conversations_client_id_fkey(id, full_name, display_name),
      provider:profiles!conversations_provider_id_fkey(id, full_name, display_name)
    `)
    .eq("id", conversationId)
    .single()

  if (!conversation) {
    redirect("/messages")
  }

  // Check if user is part of conversation
  if (conversation.client_id !== user.id && conversation.provider_id !== user.id) {
    redirect("/messages")
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  // Mark messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)

  const isClient = conversation.client_id === user.id
  const otherParty = isClient ? conversation.provider : conversation.client

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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold truncate">{conversation.subject}</h1>
              {getStatusBadge(conversation.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {isClient ? "판매자: " : "구매자: "}
              {otherParty?.display_name || otherParty?.full_name}
              {conversation.service && ` | ${conversation.service.title}`}
            </p>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface
        conversationId={conversationId}
        userId={user.id}
        initialMessages={messages || []}
        otherPartyName={otherParty?.display_name || otherParty?.full_name || "상대방"}
      />
    </div>
  )
}
