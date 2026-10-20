import type { Metadata } from "next"
import { SteamButtons } from "@/components/steam-buttons"
import { PageViewTracker } from "@/components/page-view-tracker"
import { games } from "@/lib/site-content"

export const metadata: Metadata = {
  title: "게임",
  description: "플레이타르트가 만드는 게임",
}

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">게임</h1>
      </div>

      <div className="space-y-16">
        {games.map((game) => (
          <article key={game.slug} id={game.slug} className="scroll-mt-24">
            <div className="grid gap-8 lg:grid-cols-5">
              <img
                src={game.keyArt}
                alt={game.titleEn}
                className="aspect-video w-full rounded-lg object-cover lg:col-span-3"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="lg:col-span-2">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold">
                  {game.status}
                </span>
                <h2 className="mb-1 text-3xl font-bold">{game.title}</h2>
                <p className="mb-6 text-sm text-muted-foreground">{game.titleEn}</p>
                <p className="mb-2 font-medium">{game.tagline}</p>
                <p className="mb-6 text-muted-foreground leading-relaxed">{game.description}</p>
                <div className="mb-8 flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <SteamButtons game={game} size="default" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
              {game.screenshots.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                  <img
                    src={src}
                    alt={`${game.titleEn} 스크린샷`}
                    className="aspect-video w-full rounded-md object-cover transition-opacity hover:opacity-90"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>

      <PageViewTracker pageName="games" />
    </div>
  )
}
