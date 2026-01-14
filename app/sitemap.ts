import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://play-t.art"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/course`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/product`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/outsourcing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/forum`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  // 강의 페이지
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("is_published", true)

  const coursePages: MetadataRoute.Sitemap = (courses || []).map((course) => ({
    url: `${BASE_URL}/course/${course.slug}`,
    lastModified: new Date(course.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // 제품 페이지
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_published", true)

  const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // 외주 서비스 페이지
  const { data: services } = await supabase
    .from("services")
    .select("slug, updated_at")
    .eq("is_active", true)

  const servicePages: MetadataRoute.Sitemap = (services || []).map((service) => ({
    url: `${BASE_URL}/outsourcing/${service.slug}`,
    lastModified: new Date(service.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // 포럼 게시글 (최근 100개)
  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, updated_at")
    .order("created_at", { ascending: false })
    .limit(100)

  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${BASE_URL}/forum/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  return [...staticPages, ...coursePages, ...productPages, ...servicePages, ...postPages]
}
