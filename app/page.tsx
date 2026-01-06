import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PageViewTracker } from "@/components/page-view-tracker"

// YouTube RSS 피드에서 최신 영상 가져오기
const YOUTUBE_CHANNEL_ID = "UC3foO9bhZJHkeROLdu0m2MQ"

async function getLatestYouTubeVideos(count: number = 3) {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 3600 } } // 1시간마다 갱신
    )

    if (!response.ok) return []

    const xml = await response.text()
    const videos: { videoId: string; title: string }[] = []

    // 간단한 XML 파싱 (정규식)
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []

    for (const entry of entries.slice(0, count)) {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/)

      if (videoIdMatch && titleMatch) {
        videos.push({
          videoId: videoIdMatch[1],
          title: titleMatch[1],
        })
      }
    }

    return videos
  } catch (error) {
    console.error("YouTube RSS fetch error:", error)
    return []
  }
}

// 포트폴리오 이미지 - 6열 그리드 (정사각형=2칸, 가로형=3칸)
const portfolioImages = [
  // Row 1: 가로형 2개 (3+3=6) - Eris, May가 가로형
  { src: "/portfolio/ErisAction004x1.gif", alt: "Eris", span: "col-span-3" },
  { src: "/portfolio/May_6H.gif", alt: "May", span: "col-span-3" },
  // Row 2: 정사각형 3개 (2+2+2=6)
  { src: "/portfolio/Knight_n04.gif", alt: "Knight", span: "col-span-2" },
  { src: "/portfolio/Godette.gif", alt: "Godette", span: "col-span-2" },
  { src: "/portfolio/Hunter.gif", alt: "Hunter", span: "col-span-2" },
  // Row 3: 정사각형 3개 (2+2+2=6)
  { src: "/portfolio/Silent_donation.gif", alt: "Silent Donation", span: "col-span-2" },
  { src: "/portfolio/MarcilleYADA_Loop.gif", alt: "Marcille", span: "col-span-2" },
  { src: "/portfolio/pkmOCx2.gif", alt: "Trainer", span: "col-span-2" },
  // Row 4: 정사각형 3개 (2+2+2=6)
  { src: "/portfolio/BocchiStage.gif", alt: "Bocchi Stage", span: "col-span-2" },
  { src: "/portfolio/230809~Johnny.gif", alt: "Johnny", span: "col-span-2" },
  { src: "/portfolio/Sol_Idle.gif", alt: "Sol", span: "col-span-2" },
]

// 피쳐드 콘텐츠
const featuredContent = [
  {
    type: "강의",
    title: "픽셀아트 입문",
    description: "처음 시작하는 픽셀아트, 기초부터 캐릭터 제작까지",
    href: "/course",
    cta: "강의 보러가기",
  },
  {
    type: "외주",
    title: "게임 리소스 제작",
    description: "인디 게임에 필요한 캐릭터, 타일셋, UI 제작",
    href: "/outsourcing",
    cta: "의뢰하기",
  },
  {
    type: "소개",
    title: "이 사이트도 직접 만들었습니다",
    description: "AI와 함께 나만의 플랫폼을 만드는 방법",
    href: "/course",
    cta: "자세히 보기",
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  // YouTube 최신 영상 가져오기
  const portfolioVideos = await getLatestYouTubeVideos(3)

  // Fetch featured courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  // Fetch service categories
  const { data: serviceCategories } = await supabase
    .from("service_categories")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight leading-tight md:text-5xl md:leading-snug">
              픽셀아트 강의 & 외주
              <br />
              <span className="text-primary">플레이타르트</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground leading-relaxed">
              픽셀아트, AI 웹사이트 제작, 창작자 생존 전략까지.
              <br className="hidden sm:block" />
              개인 창작자 중심의 미니 플랫폼입니다.
            </p>
          </div>

          {/* Featured Content Cards */}
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {featuredContent.map((item, index) => (
              <Card key={index} className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-foreground">
                    {item.type}
                  </span>
                </div>
                <CardHeader className="pt-12 flex-1">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">포트폴리오</h2>
            <p className="mt-2 text-muted-foreground">직접 제작한 픽셀아트 작품들</p>
          </div>

          {/* 콜라주 그리드 - 6열 큼직한 배치 */}
          <div
            className="max-w-6xl mx-auto grid grid-cols-6 gap-1"
            style={{ gridAutoRows: "200px" }}
          >
            {portfolioImages.map((image, index) => (
              <div
                key={index}
                className={`${image.span} relative flex items-center justify-center bg-muted/20 overflow-hidden hover:overflow-visible hover:z-50 group`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="min-h-full min-w-full object-cover transition-all duration-300 ease-out group-hover:min-h-0 group-hover:w-full group-hover:h-auto group-hover:object-contain group-hover:shadow-2xl group-hover:rounded-lg"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            ))}
            {/* YouTube 영상 썸네일 - 한 줄 3개 */}
            {portfolioVideos.map((video, index) => (
              <a
                key={`video-${index}`}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 relative flex items-center justify-center bg-muted/20 overflow-hidden group cursor-pointer"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt={video.title}
                  className="min-h-full min-w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 재생 버튼 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* 영상 제목 */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm font-medium truncate">{video.title}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              게임 캐릭터, 타일셋, UI 등 다양한 픽셀아트 제작이 가능합니다
            </p>
            <Button variant="outline" asChild>
              <Link href="/outsourcing">외주 의뢰하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">강의</h2>
              <p className="mt-2 text-muted-foreground">픽셀아트와 창작에 필요한 스킬을 배우세요</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/course">전체보기</Link>
            </Button>
          </div>

          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          강의 이미지
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{course.instructor_name}</span>
                        <span className="text-lg font-bold text-primary">₩{course.price?.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                강의를 준비 중입니다. 곧 만나요!
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">외주 서비스</h2>
            <p className="mt-2 text-muted-foreground">게임에 필요한 픽셀아트 리소스를 의뢰하세요</p>
          </div>

          {serviceCategories && serviceCategories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {serviceCategories.map((category) => (
                <Link key={category.id} href={`/outsourcing?category=${category.slug}`}>
                  <Card className="h-full text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center text-muted-foreground">
                서비스를 준비 중입니다
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/outsourcing">모든 서비스 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground max-w-3xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">지금 바로 시작하세요</h2>
              <p className="mb-8 text-lg opacity-90">
                픽셀아트를 배우고, 작품을 의뢰하고, 창작자로 성장하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/sign-up">무료로 가입하기</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <Link href="/course">강의 둘러보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <PageViewTracker pageName="landing" />
    </div>
  )
}
