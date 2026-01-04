"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createClient } from "@/lib/supabase/client"

interface FeedbackFormProps {
  userId?: string
  userEmail?: string
}

export function FeedbackForm({ userId, userEmail }: FeedbackFormProps) {
  const [type, setType] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState(userEmail || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (!type || !subject.trim() || !message.trim()) {
      setError("모든 필드를 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: userId || null,
        type,
        subject: subject.trim(),
        message: message.trim(),
        email: email || null,
      })

      if (error) throw error

      setSuccess(true)
      setType("")
      setSubject("")
      setMessage("")
      setEmail(userEmail || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "피드백 전송에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>피드백 보내기</CardTitle>
        <CardDescription>문의사항이나 개선 제안을 보내주시면 검토 후 답변드리겠습니다</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">피드백이 전송되었습니다</h3>
            <p className="mb-6 text-muted-foreground">소중한 의견 감사합니다. 빠른 시일 내에 답변드리겠습니다.</p>
            <Button onClick={() => setSuccess(false)}>새 피드백 작성</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">문의 유형</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="문의 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">일반 문의</SelectItem>
                  <SelectItem value="bug">버그 신고</SelectItem>
                  <SelectItem value="suggestion">개선 제안</SelectItem>
                  <SelectItem value="complaint">불편 사항</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!userId && (
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="답변 받을 이메일"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">제목</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="문의 제목"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">내용</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의 내용을 자세히 작성해주세요"
                rows={8}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "전송 중..." : "피드백 보내기"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
