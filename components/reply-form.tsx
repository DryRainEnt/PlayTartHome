"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReplyFormProps {
  postId: string
  userId: string
}

export function ReplyForm({ postId, userId }: ReplyFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      const { error: replyError } = await supabase.from("forum_replies").insert({
        post_id: postId,
        author_id: userId,
        content: content.trim(),
      })

      if (replyError) throw replyError

      // Get current reply count
      const { data: post } = await supabase.from("forum_posts").select("reply_count").eq("id", postId).single()

      // Update reply count
      await supabase
        .from("forum_posts")
        .update({ reply_count: (post?.reply_count || 0) + 1 })
        .eq("id", postId)

      setContent("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요"
        rows={4}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "작성 중..." : "댓글 작성"}
      </Button>
    </form>
  )
}
