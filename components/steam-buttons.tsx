import { Button } from "@/components/ui/button"
import type { Game } from "@/lib/site-content"

export function SteamButtons({ game, size = "lg" }: { game: Game; size?: "default" | "lg" }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size={size} asChild>
        <a href={game.steamUrl} target="_blank" rel="noopener noreferrer">
          스팀에서 찜하기
        </a>
      </Button>
      {game.demoUrl && (
        <Button size={size} variant="outline" asChild>
          <a href={game.demoUrl} target="_blank" rel="noopener noreferrer">
            무료 데모 받기
          </a>
        </Button>
      )}
    </div>
  )
}
