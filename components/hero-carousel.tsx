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
  thumbs?: string[]
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

function Slide({ slide, isFirst }: { slide: HeroSlide; isFirst: boolean }) {
  // 스팀처럼 썸네일에 마우스를 올리면 큰 이미지가 바뀜
  const [preview, setPreview] = useState<string | null>(null)
  const mainImage = preview ?? slide.image
  const Title = isFirst ? "h1" : "h2"

  return (
    <div className="grid overflow-hidden rounded-sm bg-card shadow-2xl shadow-black/50 lg:grid-cols-[minmax(0,1fr)_340px]">
      <SlideLink href={slide.href} className="block bg-black">
        <img
          src={mainImage}
          alt={slide.imageAlt}
          className="aspect-video w-full object-cover"
          style={slide.pixelated && !preview ? { imageRendering: "pixelated" } : undefined}
          loading={isFirst ? "eager" : "lazy"}
        />
      </SlideLink>

      <div className="flex flex-col gap-4 bg-gradient-to-b from-black/5 to-black/40 p-5">
        <div>
          <Title className="text-2xl font-bold leading-tight lg:text-[1.65rem]">{slide.title}</Title>
          {slide.subtitle && <p className="mt-1 text-sm text-muted-foreground">{slide.subtitle}</p>}
        </div>

        {slide.thumbs && slide.thumbs.length > 0 ? (
          <div className="hidden grid-cols-2 gap-1.5 sm:grid" onMouseLeave={() => setPreview(null)}>
            {slide.thumbs.slice(0, 4).map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                onMouseEnter={() => setPreview(src)}
                className="aspect-video w-full cursor-pointer rounded-sm object-cover opacity-80 transition-opacity hover:opacity-100"
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          slide.description && (
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{slide.description}</p>
          )
        )}

        {slide.tagline && <p className="text-sm font-medium">{slide.tagline}</p>}

        {slide.tags && slide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {slide.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-white/10 px-2 py-0.5 text-xs text-foreground/80">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-3">
          <p className="text-xs font-semibold text-primary">{slide.label}</p>
          <div className="flex flex-wrap gap-2">
            {slide.actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "default"}
                className="rounded-sm"
                asChild
              >
                <SlideLink href={action.href}>{action.label}</SlideLink>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroCarousel({ slides, heading }: { slides: HeroSlide[]; heading?: string }) {
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

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-28 w-12 -translate-y-1/2 items-center justify-center rounded-sm text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground lg:flex"

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      {/* 현재 슬라이드 이미지를 흐리게 깐 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.key}
            className={`absolute inset-0 scale-110 bg-cover bg-center blur-3xl transition-opacity duration-700 ${
              current === index ? "opacity-30" : "opacity-0"
            }`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <div className="container relative mx-auto px-4">
        {heading && <h2 className="mb-3 text-sm font-semibold tracking-wide text-foreground/80 lg:px-14">{heading}</h2>}

        <div
          className="relative lg:px-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
        >
          <Carousel setApi={setApi} opts={{ loop: true }} aria-label="최신 소식">
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={slide.key} aria-label={`${index + 1} / ${slides.length}`}>
                  <Slide slide={slide} isFirst={index === 0} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                aria-label="이전 소식"
                className={`${arrowClass} left-0`}
              >
                <ChevronLeft className="h-9 w-9" />
              </button>
              <button
                type="button"
                onClick={() => goTo((current + 1) % slides.length)}
                aria-label="다음 소식"
                className={`${arrowClass} right-0`}
              >
                <ChevronRight className="h-9 w-9" />
              </button>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${index + 1}번째 소식: ${slide.title}`}
                aria-current={current === index}
                className={`h-2.5 w-4 rounded-sm transition-colors ${
                  current === index ? "bg-foreground/70" : "bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
