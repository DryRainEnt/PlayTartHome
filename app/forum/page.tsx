import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Search, ChevronLeft, ChevronRight, MessageCircle, Eye, ThumbsUp, PenSquare } from "lucide-react"

const ITEMS_PER_PAGE = 20

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch categories
  const { data: categories } = await supabase.from("forum_categories").select("*").order("order_index")

  // Build query for posts
  let query = supabase
    .from("forum_posts")
    .select("*, author:profiles!forum_posts_author_id_fkey(full_name, display_name), category:forum_categories(*)", { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`)
  }

  const { data: posts, count } = await query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  const buildUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (params.category) urlParams.set("category", params.category)
    if (params.search) urlParams.set("search", params.search)
    urlParams.set("page", page.toString())
    return `/forum?${urlParams.toString()}`
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold">커뮤니티</h1>
          <p className="text-muted-foreground">크리에이터들과 소통하고 정보를 공유하세요</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/forum/new">
              <PenSquare className="mr-2 h-4 w-4" />
              글쓰기
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Categories */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <form action="/forum" method="GET" className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="게시글 검색..."
            defaultValue={params.search || ""}
            className="pl-10"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </form>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Button variant={!params.category ? "default" : "outline"} size="sm" asChild>
            <Link href="/forum">전체</Link>
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={params.category === category.slug ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/forum?category=${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(params.search || params.category) && (
        <p className="mb-4 text-sm text-muted-foreground">
          {count}개의 게시글
          {params.search && <span className="font-medium"> "{params.search}"</span>}
        </p>
      )}

      {/* Posts List */}
      <div className="space-y-2">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`} className="block">
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        {post.is_pinned && (
                          <Badge variant="secondary" className="text-xs">
                            공지
                          </Badge>
                        )}
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category.name}
                          </Badge>
                        )}
                        {post.is_locked && (
                          <span className="text-xs text-muted-foreground">🔒</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mb-1 text-lg font-semibold line-clamp-1">{post.title}</h3>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="truncate max-w-[120px]">
                          {post.author?.display_name || post.author?.full_name || "익명"}
                        </span>
                        <span>·</span>
                        <span className="shrink-0">{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1" title="조회수">
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1" title="댓글">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.reply_count}</span>
                      </div>
                      <div className="flex items-center gap-1" title="추천">
                        <ThumbsUp className="h-4 w-4" />
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
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {params.search ? "검색 결과가 없습니다" : "게시글이 없습니다"}
              </p>
              {user && (
                <Button asChild>
                  <Link href="/forum/new">첫 글 작성하기</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage <= 1}
          >
            <Link href={buildUrl(currentPage - 1)} aria-disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
            .map((page, idx, arr) => (
              <span key={page} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  asChild
                >
                  <Link href={buildUrl(page)}>{page}</Link>
                </Button>
              </span>
            ))}

          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={currentPage >= totalPages}
          >
            <Link href={buildUrl(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <Card className="mt-8">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">글을 작성하려면 로그인이 필요합니다</p>
            <Button asChild>
              <Link href="/auth/login">로그인</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
