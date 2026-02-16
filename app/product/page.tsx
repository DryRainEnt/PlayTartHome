import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, ChevronRight, Search, Download, ShoppingCart } from "lucide-react"
import { EmailSubscriptionForm } from "@/components/email-subscription-form"
import { PageViewTracker } from "@/components/page-view-tracker"

const ITEMS_PER_PAGE = 12

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch categories
  const { data: categories } = await supabase
    .from("product_categories")
    .select("*")
    .order("order_index")

  // Build query
  let query = supabase
    .from("products")
    .select("*, category:product_categories(*)", { count: "exact" })
    .eq("is_published", true)

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  const { data: products, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Get user email if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const buildUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (params.category) urlParams.set("category", params.category)
    if (params.search) urlParams.set("search", params.search)
    urlParams.set("page", page.toString())
    return `/product?${urlParams.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">제품</h1>
        <p className="text-muted-foreground">
          바로 사용할 수 있는 고품질 픽셀아트 에셋을 만나보세요
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <form action="/product" method="GET" className="relative md:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="제품 검색..."
            defaultValue={params.search || ""}
            className="pl-10"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button variant={!params.category ? "default" : "outline"} asChild>
            <Link href="/product">전체</Link>
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={params.category === category.slug ? "default" : "outline"}
              asChild
            >
              <Link href={`/product?category=${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      제품 이미지
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  {product.category && (
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                  <h3 className="mb-1 font-semibold line-clamp-1">{product.title}</h3>
                  {product.description && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₩{product.original_price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-lg font-bold text-primary">
                        {product.price === 0 ? "무료" : `₩${product.price.toLocaleString()}`}
                      </span>
                    </div>
                    {product.sales_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="h-3 w-3" />
                        {product.sales_count}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (params.search || params.category) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            검색 결과가 없습니다
          </CardContent>
        </Card>
      ) : null}

      {/* Email Subscription */}
      <div className="mt-8">
        <EmailSubscriptionForm
          type="newsletter"
          userEmail={user?.email}
          subscriberCount={0}
          hasContent={!!(products && products.length > 0)}
        />
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

      <PageViewTracker pageName="product-list" />
    </div>
  )
}
