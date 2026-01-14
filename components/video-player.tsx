"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from "lucide-react"

// react-player를 lazy import (SSR 방지)
import type ReactPlayerType from "react-player"

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  initialTime?: number
}

export function VideoPlayer({ src, onTimeUpdate, onEnded, initialTime = 0 }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<ReactPlayerType>(null)
  const [ReactPlayer, setReactPlayer] = useState<typeof ReactPlayerType | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [seeking, setSeeking] = useState(false)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // 클라이언트에서만 react-player 로드
  useEffect(() => {
    console.log("[VideoPlayer] Loading react-player, src:", src)
    import("react-player").then((mod) => {
      console.log("[VideoPlayer] react-player loaded")
      setReactPlayer(() => mod.default)
    })
  }, [src])

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // Seek to initial time when ready
  useEffect(() => {
    if (isReady && initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, "seconds")
    }
  }, [isReady, initialTime])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          setIsPlaying((prev) => !prev)
          break
        case "arrowleft":
        case "j":
          e.preventDefault()
          if (playerRef.current) {
            const newTime = Math.max(0, currentTime - 10)
            playerRef.current.seekTo(newTime, "seconds")
            setCurrentTime(newTime)
          }
          break
        case "arrowright":
        case "l":
          e.preventDefault()
          if (playerRef.current) {
            const newTime = Math.min(duration, currentTime + 10)
            playerRef.current.seekTo(newTime, "seconds")
            setCurrentTime(newTime)
          }
          break
        case "arrowup":
          e.preventDefault()
          setVolume((prev) => Math.min(1, prev + 0.1))
          setIsMuted(false)
          break
        case "arrowdown":
          e.preventDefault()
          setVolume((prev) => Math.max(0, prev - 0.1))
          break
        case "m":
          e.preventDefault()
          setIsMuted((prev) => !prev)
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault()
          if (playerRef.current && duration > 0) {
            const percent = parseInt(e.key) / 10
            const newTime = duration * percent
            playerRef.current.seekTo(newTime, "seconds")
            setCurrentTime(newTime)
          }
          break
      }
      resetControlsTimeout()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [currentTime, duration, resetControlsTimeout])

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleReady = () => {
    console.log("[VideoPlayer] Player ready")
    setIsReady(true)
  }

  const handleDuration = (dur: number) => {
    setDuration(dur)
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setCurrentTime(state.playedSeconds)
      onTimeUpdate?.(state.playedSeconds)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    resetControlsTimeout()
  }

  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false)
    if (playerRef.current) {
      playerRef.current.seekTo(value[0], "seconds")
    }
    resetControlsTimeout()
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  const skip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      playerRef.current.seekTo(newTime, "seconds")
      setCurrentTime(newTime)
    }
    resetControlsTimeout()
  }

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00"
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  return (
    <div
      ref={containerRef}
      className="group relative w-full h-full overflow-hidden bg-black"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {ReactPlayer && (
        <ReactPlayer
          ref={playerRef}
          url={src}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          playbackRate={playbackRate}
          onReady={handleReady}
          onDuration={handleDuration}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e, data) => console.error("[VideoPlayer] Error:", e, data)}
          onBuffer={() => console.log("[VideoPlayer] Buffering...")}
          onBufferEnd={() => console.log("[VideoPlayer] Buffer end")}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                disablekb: 1,
                origin: typeof window !== "undefined" ? window.location.origin : "",
              },
            },
            vimeo: {
              playerOptions: {
                byline: false,
                portrait: false,
                title: false,
              },
            },
          }}
        />
      )}

      {/* Click overlay to toggle play */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Play/Pause center overlay */}
      {!isPlaying && isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="h-10 w-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {(!ReactPlayer || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          onPointerDown={handleSeekMouseDown}
          onPointerUp={() => handleSeekMouseUp([currentTime])}
          className="mb-3"
        />

        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 text-white hover:bg-white/20">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          {/* Skip buttons */}
          <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="h-8 w-8 text-white hover:bg-white/20">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => skip(10)} className="h-8 w-8 text-white hover:bg-white/20">
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 text-white hover:bg-white/20">
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Time */}
          <span className="ml-2 text-sm text-white tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Playback speed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-white/20 text-xs px-2">
                {playbackRate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {playbackRates.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={playbackRate === rate ? "bg-muted" : ""}
                >
                  {rate}x {rate === 1 && "(기본)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen */}
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 text-white hover:bg-white/20">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-4 right-4 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Space: 재생/일시정지 | ←→: 10초 이동 | ↑↓: 볼륨 | F: 전체화면
      </div>
    </div>
  )
}
