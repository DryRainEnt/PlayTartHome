import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PageViewTracker } from "@/components/page-view-tracker"
import { SteamButtons } from "@/components/steam-buttons"
import { ExternalCourseCard } from "@/components/external-course-card"
import { games, externalCourses } from "@/lib/site-content"

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

// 포트폴리오 이미지 - 반응형 그리드 (모바일2열, 태블릿4열, 데스크탑6열)
const portfolioImages = [
  // Row 1: 가로형 2개 - Eris, May
  { src: "/portfolio/ErisAction004x1.gif", alt: "Eris", span: "col-span-2 lg:col-span-3" },
  { src: "/portfolio/May_6H.gif", alt: "May", span: "col-span-2 lg:col-span-3" },
  // Row 2: 정사각형 3개
  { src: "/portfolio/Knight_n04.gif", alt: "Knight", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/Godette.gif", alt: "Godette", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/Hunter.gif", alt: "Hunter", span: "col-span-1 sm:col-span-2" },
  // Row 3: 정사각형 3개
  { src: "/portfolio/Silent_donation.gif", alt: "Silent Donation", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/MarcilleYADA_Loop.gif", alt: "Marcille", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/pkmOCx2.gif", alt: "Trainer", span: "col-span-1 sm:col-span-2" },
  // Row 4: 정사각형 3개
  { src: "/portfolio/BocchiStage.gif", alt: "Bocchi Stage", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/230809~Johnny.gif", alt: "Johnny", span: "col-span-1 sm:col-span-2" },
  { src: "/portfolio/Sol_Idle.gif", alt: "Sol", span: "col-span-1 sm:col-span-2" },
]

export default async function HomePage() {
  const supabase = await createClient()
  const featuredGame = games[0]

  // YouTube 최신 영상 가져오기
  const portfolioVideos = await getLatestYouTubeVideos(3)

  // Fetch featured courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col">
      {/* Hero Section - 대표 게임 */}
      <section className="dark bg-background text-foreground py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
            <a
              href={featuredGame.steamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lg:col-span-3 overflow-hidden rounded-lg"
            >
              <img
                src={featuredGame.keyArt}
                alt={featuredGame.titleEn}
                className="aspect-video w-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </a>

            <div className="lg:col-span-2">
              <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold">
                {featuredGame.status} · 데모 공개 중
              </span>
              <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">{featuredGame.title}</h1>
              <p className="mb-6 text-sm text-muted-foreground">{featuredGame.titleEn}</p>
              <p className="mb-2 text-lg font-medium">{featuredGame.tagline}</p>
              <p className="mb-6 text-muted-foreground leading-relaxed">{featuredGame.description}</p>
              <div className="mb-8 flex flex-wrap gap-2">
                {featuredGame.tags.map((tag) => (
                  <span key={tag} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <SteamButtons game={featuredGame} />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
            {featuredGame.screenshots.slice(0, 4).map((src) => (
              <img
                key={src}
                src={src}
                alt={`${featuredGame.titleEn} 스크린샷`}
                className="aspect-video w-full rounded-md object-cover"
                loading="lazy"
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/games" className="text-sm text-muted-foreground hover:text-primary">
              게임 더 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">강의</h2>
              <p className="mt-2 text-muted-foreground">게임 만들면서 익힌 것들을 가르칩니다</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/course">전체보기</Link>
            </Button>
          </div>

          {courses && courses.length > 0 && (
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
                        <div className="text-right">
                          {course.original_price && course.original_price > course.price && (
                            <span className="mr-2 text-sm text-muted-foreground line-through">
                              ₩{course.original_price.toLocaleString()}
                            </span>
                          )}
                          <span className="text-lg font-bold text-primary">₩{course.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {externalCourses.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-lg font-semibold">다른 플랫폼 강의</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {externalCourses.map((course) => (
                  <ExternalCourseCard key={course.url} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">픽셀아트</h2>
            <p className="mt-2 text-muted-foreground">직접 제작한 픽셀아트 작품들</p>
          </div>

          {/* 콜라주 그리드 - 6열 큼직한 배치 */}
          <div
            className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1"
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
                className="col-span-1 sm:col-span-2 relative flex items-center justify-center bg-muted/20 overflow-hidden group cursor-pointer"
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
            <Button variant="outline" asChild>
              <a
                href={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                유튜브 채널
              </a>
            </Button>
          </div>
        </div>
      </section>

      <PageViewTracker pageName="landing" />
    </div>
  )
}
