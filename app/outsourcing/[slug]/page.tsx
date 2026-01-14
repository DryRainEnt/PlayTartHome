import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageViewTracker } from "@/components/page-view-tracker"
import { ServiceJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://playtart.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from("services")
    .select("title, description, thumbnail_url, price_min, price_max, category:service_categories(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!service) {
    return {
      title: "서비스를 찾을 수 없습니다",
    }
  }

  const title = service.title
  const categoryName = (service.category as any)?.name || "외주 서비스"
  let priceText = "가격 문의"
  if (service.price_min && service.price_max) {
    priceText = `₩${service.price_min.toLocaleString()} - ₩${service.price_max.toLocaleString()}`
  } else if (service.price_min) {
    priceText = `₩${service.price_min.toLocaleString()}~`
  }
  const description = service.description || `${categoryName} - ${title} (${priceText})`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/outsourcing/${slug}`,
      type: "website",
      images: service.thumbnail_url ? [{ url: service.thumbnail_url, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.thumbnail_url ? [service.thumbnail_url] : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch service
  const { data: service } = await supabase
    .from("services")
    .select("*, provider:profiles!services_provider_id_fkey(*), category:service_categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!service) {
    redirect("/outsourcing")
  }

  // 외부 링크가 있으면 API 리다이렉트 라우트로 보냄 (트래킹 포함)
  if (service.external_url) {
    redirect(`/api/redirect/service/${slug}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const priceRange = service.price_min && service.price_max
    ? `₩${service.price_min.toLocaleString()} - ₩${service.price_max.toLocaleString()}`
    : service.price_min
    ? `₩${service.price_min.toLocaleString()}~`
    : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceJsonLd
        name={service.title}
        description={service.description || ""}
        provider={service.provider?.display_name || service.provider?.full_name || "Playtart"}
        url={`/outsourcing/${slug}`}
        image={service.thumbnail_url}
        priceRange={priceRange}
      />
      <PageViewTracker resourceType="service" resourceId={service.id} resourceSlug={slug} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {service.thumbnail_url ? (
              <img
                src={service.thumbnail_url || "/placeholder.svg"}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">서비스 이미지</div>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2">
            {service.category && <Badge>{service.category.name}</Badge>}
            {service.rating > 0 && (
              <span className="text-sm text-muted-foreground">
                ⭐ {service.rating.toFixed(1)} ({service.review_count}개 리뷰)
              </span>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-bold">{service.title}</h1>
          <p className="mb-6 text-lg text-muted-foreground">{service.description}</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>제공자 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                  {service.provider?.avatar_url ? (
                    <img
                      src={service.provider.avatar_url || "/placeholder.svg"}
                      alt={service.provider.display_name || service.provider.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      {(service.provider?.display_name || service.provider?.full_name || "U").charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{service.provider?.display_name || service.provider?.full_name}</h3>
                  {service.provider?.bio && <p className="text-sm text-muted-foreground">{service.provider.bio}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="mb-6">
                {service.price_min && service.price_max ? (
                  <p className="text-3xl font-bold text-primary">
                    ₩{service.price_min.toLocaleString()} - ₩{service.price_max.toLocaleString()}
                  </p>
                ) : service.price_min ? (
                  <p className="text-3xl font-bold text-primary">₩{service.price_min.toLocaleString()}~</p>
                ) : (
                  <p className="text-xl font-semibold text-muted-foreground">가격 문의</p>
                )}
              </div>

              {user ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/outsourcing/${slug}/request`}>의뢰하기</Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/auth/login">로그인 후 의뢰하기</Link>
                </Button>
              )}

              <div className="mt-6 space-y-3 border-t pt-6 text-sm">
                {service.delivery_days && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>평균 {service.delivery_days}일 소요</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>수정 요청 가능</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
