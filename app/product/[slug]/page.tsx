import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  ShoppingCart,
  Star,
  FileType,
  HardDrive,
  CheckCircle,
} from "lucide-react"
import { PageViewTracker } from "@/components/page-view-tracker"
import { ProductJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://play-t.art"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("title, description, thumbnail_url, price, category:product_categories(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!product) {
    return {
      title: "제품을 찾을 수 없습니다",
    }
  }

  const title = product.title
  const categoryName = (product.category as any)?.name || "제품"
  const priceText = product.price === 0 ? "무료" : `₩${product.price.toLocaleString()}`
  const description = product.description || `${categoryName} - ${title} (${priceText})`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/product/${slug}`,
      type: "website",
      images: product.thumbnail_url ? [{ url: product.thumbnail_url, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch product
  const { data: product } = await supabase
    .from("products")
    .select("*, category:product_categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!product) {
    redirect("/product")
  }

  // Check if user has purchased
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from("product_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "completed")
      .single()

    hasPurchased = !!purchase
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_published", true)
    .limit(4)

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductJsonLd
        name={product.title}
        description={product.description || ""}
        image={product.thumbnail_url}
        url={`/product/${slug}`}
        price={product.price}
      />
      <PageViewTracker resourceType="product" resourceId={product.id} resourceSlug={slug} />
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/product">
          <ArrowLeft className="mr-2 h-4 w-4" />
          제품 목록
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.title}
                className="h-full w-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                제품 이미지
              </div>
            )}
          </div>

          {/* Preview images */}
          {product.preview_images && product.preview_images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.preview_images.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={img}
                    alt={`${product.title} preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Badge variant="outline" className="mb-3">
              {product.category.name}
            </Badge>
          )}

          <h1 className="mb-4 text-3xl font-bold">{product.title}</h1>

          {product.description && (
            <p className="mb-6 text-lg text-muted-foreground">{product.description}</p>
          )}

          {/* Stats */}
          <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
            {product.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                {product.rating.toFixed(1)} ({product.review_count})
              </span>
            )}
            {product.sales_count > 0 && (
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {product.sales_count}회 판매
              </span>
            )}
          </div>

          {/* File Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.file_format && (
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="text-muted-foreground">포맷: </span>
                      {product.file_format}
                    </span>
                  </div>
                )}
                {product.file_size && (
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="text-muted-foreground">크기: </span>
                      {product.file_size}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price & Purchase */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-end gap-3">
                {discountPercent > 0 && (
                  <>
                    <Badge variant="destructive">{discountPercent}% 할인</Badge>
                    <span className="text-lg text-muted-foreground line-through">
                      ₩{product.original_price?.toLocaleString()}
                    </span>
                  </>
                )}
                <span className="text-3xl font-bold text-primary">
                  {product.price === 0 ? "무료" : `₩${product.price.toLocaleString()}`}
                </span>
              </div>

              {hasPurchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">구매 완료</span>
                  </div>
                  {product.download_url && (
                    <Button className="w-full" size="lg" asChild>
                      <a href={product.download_url} download>
                        <Download className="mr-2 h-5 w-5" />
                        다운로드
                      </a>
                    </Button>
                  )}
                </div>
              ) : user ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/product/${slug}/purchase`}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.price === 0 ? "무료로 받기" : "구매하기"}
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/auth/login?redirect=/product/${slug}`}>
                    로그인 후 구매
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Content/Description */}
      {product.content && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">상세 설명</h2>
          <Card>
            <CardContent className="prose max-w-none p-6 dark:prose-invert">
              <div className="whitespace-pre-wrap">{product.content}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">관련 제품</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/product/${related.slug}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    {related.thumbnail_url ? (
                      <img
                        src={related.thumbnail_url}
                        alt={related.title}
                        className="h-full w-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        제품
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold line-clamp-1">{related.title}</h3>
                    <span className="font-bold text-primary">
                      {related.price === 0 ? "무료" : `₩${related.price.toLocaleString()}`}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
