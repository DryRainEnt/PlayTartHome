const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://play-t.art"

interface OrganizationJsonLdProps {
  name?: string
  description?: string
  logo?: string
}

export function OrganizationJsonLd({
  name = "Playtart",
  description = "픽셀아트 강의 & 외주 플랫폼",
  logo = "/PlayTartSplash2.png",
}: OrganizationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url: BASE_URL,
    logo: `${BASE_URL}${logo}`,
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface CourseJsonLdProps {
  name: string
  description: string
  provider: string
  url: string
  image?: string
  price: number
  priceCurrency?: string
}

export function CourseJsonLd({
  name,
  description,
  provider,
  url,
  image,
  price,
  priceCurrency = "KRW",
}: CourseJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
      sameAs: BASE_URL,
    },
    url: `${BASE_URL}${url}`,
    image: image || undefined,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ProductJsonLdProps {
  name: string
  description: string
  image?: string
  url: string
  price: number
  priceCurrency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
}

export function ProductJsonLd({
  name,
  description,
  image,
  url,
  price,
  priceCurrency = "KRW",
  availability = "InStock",
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || undefined,
    url: `${BASE_URL}${url}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: `https://schema.org/${availability}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ServiceJsonLdProps {
  name: string
  description: string
  provider: string
  url: string
  image?: string
  priceRange?: string
}

export function ServiceJsonLd({
  name,
  description,
  provider,
  url,
  image,
  priceRange,
}: ServiceJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Person",
      name: provider,
    },
    url: `${BASE_URL}${url}`,
    image: image || undefined,
    priceRange: priceRange || undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ArticleJsonLdProps {
  headline: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  url: string
  image?: string
}

export function ArticleJsonLd({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    url: `${BASE_URL}${url}`,
    image: image || undefined,
    publisher: {
      "@type": "Organization",
      name: "Playtart",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/PlayTartSplash2.png`,
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
