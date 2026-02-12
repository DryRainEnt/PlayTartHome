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

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  onDurationDetected?: (duration: number) => void
  initialTime?: number
}

// YouTube URL에서 video ID 추출
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// YouTube URL인지 확인
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

// YouTube IFrame API 타입
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
            onStateChange?: (event: { data: number; target: YTPlayer }) => void
          }
        }
      ) => YTPlayer
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  setVolume: (volume: number) => void
  getVolume: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  destroy: () => void
}

// YouTube API 로드 상태
let youtubeApiLoaded = false
let youtubeApiLoading = false
const youtubeApiCallbacks: (() => void)[] = []

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (youtubeApiLoaded) {
      resolve()
      return
    }

    youtubeApiCallbacks.push(resolve)

    if (youtubeApiLoading) {
      return
    }

    youtubeApiLoading = true

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      youtubeApiLoaded = true
      youtubeApiLoading = false
      youtubeApiCallbacks.forEach((cb) => cb())
      youtubeApiCallbacks.length = 0
    }
  })
}

// YouTube Player Component
function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onEnded,
  onDurationDetected,
  initialTime = 0,
}: {
  videoId: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  onDurationDetected?: (duration: number) => void
  initialTime?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const playerIdRef = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const initPlayer = async () => {
      await loadYouTubeApi()

      if (!mounted || !containerRef.current) return

      // Create player container
      const playerDiv = document.createElement("div")
      playerDiv.id = playerIdRef.current
      containerRef.current.appendChild(playerDiv)

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          start: Math.floor(initialTime),
        },
        events: {
          onReady: (event) => {
            if (!mounted) return
            setIsReady(true)

            // Get video duration and notify
            const duration = event.target.getDuration()
            if (duration && duration > 0) {
              onDurationDetected?.(Math.floor(duration))
            }

            // Start time tracking interval
            intervalRef.current = setInterval(() => {
              if (playerRef.current) {
                const state = playerRef.current.getPlayerState()
                // Only track when playing
                if (state === window.YT.PlayerState.PLAYING) {
                  const currentTime = playerRef.current.getCurrentTime()
                  onTimeUpdate?.(currentTime)
                }
              }
            }, 10000) // Every 10 seconds, matching HTML5 player behavior
          },
          onStateChange: (event) => {
            if (!mounted) return
            // Video ended
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded?.()
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      mounted = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          // Player might already be destroyed
        }
      }
    }
  }, [videoId, initialTime, onTimeUpdate, onEnded, onDurationDetected])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}

export function VideoPlayer({ src, onTimeUpdate, onEnded, onDurationDetected, initialTime = 0 }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  const isYouTube = isYouTubeUrl(src)
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(src) : null

  // Auto-hide controls (HTML5 video only)
  const resetControlsTimeout = useCallback(() => {
    if (isYouTube) return // YouTube는 자체 컨트롤 사용

    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying, isYouTube])

  // HTML5 Video 이벤트 핸들러
  useEffect(() => {
    if (isYouTube) return

    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (video.duration && video.duration > 0) {
        onDurationDetected?.(Math.floor(video.duration))
      }
      if (initialTime > 0) {
        video.currentTime = initialTime
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
    }
  }, [initialTime, onTimeUpdate, onEnded, isYouTube])

  // Keyboard shortcuts (HTML5 video only)
  useEffect(() => {
    if (isYouTube) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const video = videoRef.current
      if (!video) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "arrowleft":
        case "j":
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case "arrowright":
        case "l":
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case "arrowup":
          e.preventDefault()
          setVolume((prev) => {
            const newVol = Math.min(1, prev + 0.1)
            if (video) video.volume = newVol
            return newVol
          })
          setIsMuted(false)
          if (video) video.muted = false
          break
        case "arrowdown":
          e.preventDefault()
          setVolume((prev) => {
            const newVol = Math.max(0, prev - 0.1)
            if (video) video.volume = newVol
            return newVol
          })
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
      }
      resetControlsTimeout()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [resetControlsTimeout, isYouTube])

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (isYouTube) return

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
    resetControlsTimeout()
  }

  const handleSeek = (value: number[]) => {
    if (isYouTube) return

    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
    resetControlsTimeout()
  }

  const handleVolumeChange = (value: number[]) => {
    if (isYouTube) return

    if (videoRef.current) {
      videoRef.current.volume = value[0]
      setVolume(value[0])
      setIsMuted(value[0] === 0)
    }
  }

  const toggleMute = () => {
    if (isYouTube) return

    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
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
    if (isYouTube) return

    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
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

  // YouTube Player with API
  if (isYouTube && youtubeVideoId) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-black">
        <YouTubePlayer
          videoId={youtubeVideoId}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onDurationDetected={onDurationDetected}
          initialTime={initialTime}
        />
      </div>
    )
  }

  // HTML5 Video Player
  return (
    <div
      ref={containerRef}
      className="group relative w-full h-full overflow-hidden bg-black"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-10 w-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
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
                  onClick={() => {
                    setPlaybackRate(rate)
                    if (videoRef.current) videoRef.current.playbackRate = rate
                  }}
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
