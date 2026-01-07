import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react"
import { EmailSubscriptionForm } from "@/components/email-subscription-form"
import { PageViewTracker } from "@/components/page-view-tracker"

const ITEMS_PER_PAGE = 9

export default async function OutsourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch categories
  const { data: categories } = await supabase.from("service_categories").select("*").order("created_at")

  // Build query
  let query = supabase
    .from("services")
    .select("*, provider:profiles!services_provider_id_fkey(full_name, display_name)", { count: "exact" })
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

  const { data: services, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Get subscriber count for empty state
  const { data: subscriberCount } = await supabase
    .rpc("get_subscription_count", { sub_type: "new_service" })

  // Get user email if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const buildUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (params.category) urlParams.set("category", params.category)
    if (params.search) urlParams.set("search", params.search)
    urlParams.set("page", page.toString())
    return `/outsourcing?${urlParams.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">외주</h1>
        <p className="text-muted-foreground">전문가에게 프로젝트를 맡기고 완성도 높은 결과물을 받아보세요</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <form action="/outsourcing" method="GET" className="relative md:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="서비스 검색..."
            defaultValue={params.search || ""}
            className="pl-10"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button variant={!params.category ? "default" : "outline"} asChild>
            <Link href="/outsourcing">전체</Link>
          </Button>
          {categories?.map((category) => (
            <Button key={category.id} variant={params.category === category.slug ? "default" : "outline"} asChild>
              <Link href={`/outsourcing?category=${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Service Grid */}
      {services && services.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} href={`/outsourcing/${service.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  {service.thumbnail_url ? (
                    <img
                      src={service.thumbnail_url || "/placeholder.svg"}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      서비스 이미지
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    {service.rating > 0 && (
                      <span className="text-xs text-muted-foreground">⭐ {service.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 flex items-center gap-1">
                    {service.title}
                    {service.external_url && (
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {service.provider?.display_name || service.provider?.full_name}
                    </span>
                    <div className="text-right">
                      {service.price_min && service.price_max ? (
                        <span className="text-lg font-bold text-primary">
                          ₩{service.price_min.toLocaleString()} - ₩{service.price_max.toLocaleString()}
                        </span>
                      ) : service.price_min ? (
                        <span className="text-lg font-bold text-primary">₩{service.price_min.toLocaleString()}~</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">가격 문의</span>
                      )}
                    </div>
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
          type="new_service"
          userEmail={user?.email}
          subscriberCount={subscriberCount || 0}
          hasContent={services && services.length > 0}
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

      <PageViewTracker pageName="outsourcing-list" />
    </div>
  )
}
