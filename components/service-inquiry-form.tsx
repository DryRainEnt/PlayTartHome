"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MessageCircle, Send } from "lucide-react"

interface ServiceInquiryFormProps {
  serviceId: string
  providerId: string
  userId: string
  serviceName: string
}

export function ServiceInquiryForm({ serviceId, providerId, userId, serviceName }: ServiceInquiryFormProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!subject.trim() || !message.trim()) {
      setError("제목과 내용을 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          service_id: serviceId,
          client_id: userId,
          provider_id: providerId,
          subject: subject.trim(),
          status: "open",
        })
        .select()
        .single()

      if (convError) throw convError

      // Create first message
      const fullMessage = `**서비스 문의: ${serviceName}**\n\n${message.trim()}${
        budget ? `\n\n**예산:** ${budget}` : ""
      }${deadline ? `\n\n**희망 기한:** ${deadline}` : ""}`

      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: userId,
        content: fullMessage,
      })

      if (msgError) throw msgError

      setSuccess(true)
      // Optionally redirect to messages page
      // router.push('/messages/' + conversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 전송에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold">문의가 전송되었습니다</h3>
          <p className="mb-6 text-muted-foreground">
            담당자가 확인 후 빠른 시일 내에 답변드리겠습니다.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setSuccess(false)}>
              추가 문의하기
            </Button>
            <Button onClick={() => router.push("/my-page?tab=messages")}>
              내 메시지 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          서비스 문의하기
        </CardTitle>
        <CardDescription>
          프로젝트에 대해 상담하고 견적을 받아보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">문의 제목</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 게임 캐릭터 스프라이트 제작 문의"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">예산 (선택)</Label>
              <Input
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="예: 50만원 내외"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">희망 기한 (선택)</Label>
              <Input
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="예: 2주 내"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">문의 내용</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="프로젝트에 대해 자세히 설명해주세요. (컨셉, 스타일, 수량 등)"
              rows={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "전송 중..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                문의 보내기
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
