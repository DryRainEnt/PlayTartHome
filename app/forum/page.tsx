import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch categories
  const { data: categories } = await supabase.from("forum_categories").select("*").order("order_index")

  // Build query for posts
  let query = supabase
    .from("forum_posts")
    .select("*, author:profiles!forum_posts_author_id_fkey(full_name, display_name), category:forum_categories(*)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  const { data: posts } = await query.limit(50)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">커뮤니티</h1>
          <p className="text-muted-foreground">크리에이터들과 소통하고 정보를 공유하세요</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/forum/new">글쓰기</Link>
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={!params.category ? "default" : "outline"} asChild>
          <Link href="/forum">전체</Link>
        </Button>
        {categories?.map((category) => (
          <Button key={category.id} variant={params.category === category.slug ? "default" : "outline"} asChild>
            <Link href={`/forum?category=${category.slug}`}>{category.name}</Link>
          </Button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {post.is_pinned && <Badge variant="secondary">공지</Badge>}
                        {post.category && <Badge variant="outline">{post.category.name}</Badge>}
                        {post.is_locked && (
                          <span className="text-xs text-muted-foreground" title="잠긴 게시글">
                            🔒
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{post.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{post.author?.display_name || post.author?.full_name}</span>
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>👁</span>
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{post.reply_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👍</span>
                        <span>{post.like_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">게시글이 없습니다</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
