"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

export interface HeroSlide {
  key: string
  label: string
  title: string
  subtitle?: string
  tagline?: string
  description?: string
  tags?: string[]
  image: string
  imageAlt: string
  pixelated?: boolean
  href: string
  actions: { label: string; href: string; variant?: "default" | "outline" }[]
}

const AUTOPLAY_MS = 7000

const isExternal = (href: string) => href.startsWith("http")

function SlideLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const stoppedRef = useRef(false) // 사용자가 직접 넘기면 자동 넘김 중단

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    const onPointerDown = () => {
      stoppedRef.current = true
    }
    onSelect()
    api.on("select", onSelect)
    api.on("pointerDown", onPointerDown)
    return () => {
      api.off("select", onSelect)
      api.off("pointerDown", onPointerDown)
    }
  }, [api])

  useEffect(() => {
    if (!api || paused || slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => {
      if (!stoppedRef.current) api.scrollNext()
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [api, paused, slides.length])

  const goTo = (index: number) => {
    stoppedRef.current = true
    api?.scrollTo(index)
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      aria-label="최신 소식"
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.key} aria-label={`${index + 1} / ${slides.length}`}>
            <div className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
              <SlideLink href={slide.href} className="lg:col-span-3 overflow-hidden rounded-lg bg-muted">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="aspect-video w-full object-cover"
                  style={slide.pixelated ? { imageRendering: "pixelated" } : undefined}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </SlideLink>

              <div className="lg:col-span-2">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold">
                  {slide.label}
                </span>
                {index === 0 ? (
                  <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-5xl">{slide.title}</h1>
                ) : (
                  <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{slide.title}</h2>
                )}
                {slide.subtitle && <p className="mb-6 text-sm text-muted-foreground">{slide.subtitle}</p>}
                {slide.tagline && <p className="mb-2 text-lg font-medium">{slide.tagline}</p>}
                {slide.description && (
                  <p className="mb-6 line-clamp-3 text-muted-foreground leading-relaxed">{slide.description}</p>
                )}
                {slide.tags && slide.tags.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {slide.tags.map((tag) => (
                      <span key={tag} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {slide.actions.map((action) => (
                    <Button key={action.label} size="lg" variant={action.variant ?? "default"} asChild>
                      <SlideLink href={action.href}>{action.label}</SlideLink>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {slides.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            aria-label="이전 소식"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${index + 1}번째 소식: ${slide.title}`}
                aria-current={current === index}
                className={`h-2 rounded-full transition-all ${
                  current === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goTo((current + 1) % slides.length)}
            aria-label="다음 소식"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </Carousel>
  )
}
