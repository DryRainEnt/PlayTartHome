"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Heart, MessageSquare, MoreHorizontal, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface Comment {
  id: string
  lesson_id: string
  user_id: string
  parent_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  replies?: Comment[]
  isLiked?: boolean
}

interface LessonCommentsProps {
  lessonId: string
  userId: string
}

export function LessonComments({ lessonId, userId }: LessonCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const supabase = createClient()

  // Fetch comments
  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from("lesson_comments")
      .select(`
        *,
        user:profiles!lesson_comments_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true })

    if (!commentsData) {
      setComments([])
      setLoading(false)
      return
    }

    // Get user's likes
    const { data: likesData } = await supabase
      .from("lesson_comment_likes")
      .select("comment_id")
      .eq("user_id", userId)

    const likedCommentIds = new Set(likesData?.map((l) => l.comment_id) || [])

    // Build comment tree
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    commentsData.forEach((comment) => {
      const commentWithMeta: Comment = {
        ...comment,
        isLiked: likedCommentIds.has(comment.id),
        replies: [],
      }
      commentMap.set(comment.id, commentWithMeta)
    })

    commentsData.forEach((comment) => {
      const commentWithMeta = commentMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies!.push(commentWithMeta)
        }
      } else {
        rootComments.push(commentWithMeta)
      }
    })

    setComments(rootComments)
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
  }, [lessonId, userId])

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from("lesson_comments").insert({
      lesson_id: lessonId,
      user_id: userId,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment("")
      await fetchComments()
    }
    setSubmitting(false)
  }

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from("lesson_comments").insert({
      lesson_id: lessonId,
      user_id: userId,
      parent_id: parentId,
      content: replyContent.trim(),
    })

    if (!error) {
      setReplyContent("")
      setReplyingTo(null)
      setExpandedReplies((prev) => new Set([...prev, parentId]))
      await fetchComments()
    }
    setSubmitting(false)
  }

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from("lesson_comments")
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq("id", commentId)

    if (!error) {
      setEditingId(null)
      setEditContent("")
      await fetchComments()
    }
    setSubmitting(false)
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return

    const { error } = await supabase.from("lesson_comments").delete().eq("id", commentId)

    if (!error) {
      await fetchComments()
    }
  }

  // Toggle like
  const handleToggleLike = async (comment: Comment) => {
    if (comment.isLiked) {
      await supabase
        .from("lesson_comment_likes")
        .delete()
        .eq("comment_id", comment.id)
        .eq("user_id", userId)
    } else {
      await supabase.from("lesson_comment_likes").insert({
        comment_id: comment.id,
        user_id: userId,
      })
    }
    await fetchComments()
  }

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  // Comment item component
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isEditing = editingId === comment.id
    const isOwner = comment.user_id === userId
    const hasReplies = comment.replies && comment.replies.length > 0
    const showReplies = expandedReplies.has(comment.id)

    return (
      <div className={`${isReply ? "ml-8 mt-3" : "mt-4"}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.user?.avatar_url || undefined} />
            <AvatarFallback>
              {comment.user?.full_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user?.full_name || "익명"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
              {comment.created_at !== comment.updated_at && (
                <span className="text-xs text-muted-foreground">(수정됨)</span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent("")
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => handleToggleLike(comment)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    comment.isLiked
                      ? "text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`}
                  />
                  {comment.like_count > 0 && comment.like_count}
                </button>

                {!isReply && (
                  <button
                    onClick={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      setReplyContent("")
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    답글
                  </button>
                )}

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  rows={2}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    답글 작성
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent("")
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}

            {/* Replies toggle */}
            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    답글 숨기기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    답글 {comment.replies!.length}개 보기
                  </>
                )}
              </button>
            )}

            {/* Replies list */}
            {showReplies && comment.replies && (
              <div className="border-l-2 border-muted pl-3 mt-2">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">댓글 {totalComments > 0 && `(${totalComments})`}</h3>
      </div>

      {/* New comment form */}
      <div className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요... (질문, 의견 환영!)"
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            댓글 작성
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>아직 댓글이 없습니다</p>
          <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
        </div>
      )}
    </div>
  )
}
