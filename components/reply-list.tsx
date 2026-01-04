"use client"

import { Card, CardContent } from "./ui/card"

interface ReplyListProps {
  replies: any[]
  postId: string
  userId?: string
}

export function ReplyList({ replies }: ReplyListProps) {
  if (replies.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">아직 댓글이 없습니다</p>
  }

  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <Card key={reply.id}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="font-semibold">{reply.author?.display_name || reply.author?.full_name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{new Date(reply.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            <p className="whitespace-pre-wrap">{reply.content}</p>
            {reply.like_count > 0 && <p className="mt-2 text-xs text-muted-foreground">👍 {reply.like_count}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
