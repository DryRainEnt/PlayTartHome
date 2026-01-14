import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PostActions } from "@/components/post-actions"
import { ReplyList } from "@/components/reply-list"
import { ReplyForm } from "@/components/reply-form"
import { PageViewTracker } from "@/components/page-view-tracker"
import { MarkdownContent } from "@/components/markdown-content"

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch post
  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, author:profiles!forum_posts_author_id_fkey(*), category:forum_categories(*)")
    .eq("id", postId)
    .single()

  if (!post) {
    redirect("/forum")
  }

  // Note: view_count is now handled by PageViewTracker component

  // Fetch replies
  const { data: replies } = await supabase
    .from("forum_replies")
    .select("*, author:profiles!forum_replies_author_id_fkey(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  // Check if user liked the post
  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from("forum_post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    userLiked = !!like
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageViewTracker resourceType="forum_post" resourceId={postId} />
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/forum">← 목록으로</Link>
        </Button>

        {/* Post */}
        <Card className="mb-6">
          <CardHeader>
            <div className="mb-3 flex items-center gap-2">
              {post.is_pinned && <Badge variant="secondary">공지</Badge>}
              {post.category && <Badge variant="outline">{post.category.name}</Badge>}
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{post.author?.display_name || post.author?.full_name}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
              <span>·</span>
              <span>조회 {post.view_count}</span>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={post.content} className="mb-6" />

            <PostActions postId={postId} userId={user?.id} userLiked={userLiked} likeCount={post.like_count} />
          </CardContent>
        </Card>

        {/* Replies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>댓글 {post.reply_count}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReplyList replies={replies || []} postId={postId} userId={user?.id} />
          </CardContent>
        </Card>

        {/* Reply Form */}
        {user && !post.is_locked ? (
          <Card>
            <CardHeader>
              <CardTitle>댓글 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <ReplyForm postId={postId} userId={user.id} />
            </CardContent>
          </Card>
        ) : !user ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">댓글을 작성하려면 로그인이 필요합니다</p>
              <Button asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">이 게시글은 잠겨있습니다</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
