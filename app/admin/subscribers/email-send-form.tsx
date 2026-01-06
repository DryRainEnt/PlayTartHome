"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"

interface EmailSendFormProps {
  typeCounts: {
    new_course: number
    new_service: number
    newsletter: number
  }
}

export function EmailSendForm({ typeCounts }: EmailSendFormProps) {
  const [subscriptionType, setSubscriptionType] = useState<string>("all")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const getRecipientCount = () => {
    if (subscriptionType === "all") {
      return typeCounts.new_course + typeCounts.new_service + typeCounts.newsletter
    }
    return typeCounts[subscriptionType as keyof typeof typeCounts] || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !content.trim()) {
      setResult({ success: false, message: "제목과 내용을 입력해주세요." })
      return
    }

    const recipientCount = getRecipientCount()
    if (recipientCount === 0) {
      setResult({ success: false, message: "발송할 구독자가 없습니다." })
      return
    }

    if (!confirm(`${recipientCount}명에게 이메일을 발송하시겠습니까?`)) {
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          subscriptionType: subscriptionType === "all" ? undefined : subscriptionType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `${data.totalSent}명에게 이메일을 발송했습니다.`,
        })
        setSubject("")
        setContent("")
      } else {
        setResult({
          success: false,
          message: data.error || "발송 중 오류가 발생했습니다.",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "네트워크 오류가 발생했습니다.",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">발송 대상</Label>
          <Select value={subscriptionType} onValueChange={setSubscriptionType}>
            <SelectTrigger>
              <SelectValue placeholder="발송 대상 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                전체 ({typeCounts.new_course + typeCounts.new_service + typeCounts.newsletter}명)
              </SelectItem>
              <SelectItem value="new_course">
                새 강의 알림 ({typeCounts.new_course}명)
              </SelectItem>
              <SelectItem value="new_service">
                새 외주 알림 ({typeCounts.new_service}명)
              </SelectItem>
              <SelectItem value="newsletter">
                뉴스레터 ({typeCounts.newsletter}명)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">제목</Label>
          <Input
            id="subject"
            placeholder="이메일 제목을 입력하세요"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          placeholder="이메일 내용을 입력하세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          disabled={sending}
        />
        <p className="text-xs text-muted-foreground">
          줄바꿈은 자동으로 적용됩니다. HTML 태그는 지원하지 않습니다.
        </p>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          발송 대상: <strong>{getRecipientCount()}명</strong>
        </p>
        <Button type="submit" disabled={sending || getRecipientCount() === 0}>
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              발송 중...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              이메일 발송
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
