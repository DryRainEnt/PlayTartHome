import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function OutsourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase.from("service_categories").select("*").order("created_at")

  // Build query
  let query = supabase
    .from("services")
    .select("*, provider:profiles!services_provider_id_fkey(full_name, display_name)")
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

  const { data: services } = await query.order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">아웃소싱</h1>
        <p className="text-muted-foreground">전문가에게 프로젝트를 맡기고 완성도 높은 결과물을 받아보세요</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <Input placeholder="서비스 검색..." className="md:max-w-md" />
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
                  <CardTitle className="line-clamp-2">{service.title}</CardTitle>
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
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">서비스를 찾을 수 없습니다</CardContent>
        </Card>
      )}
    </div>
  )
}
