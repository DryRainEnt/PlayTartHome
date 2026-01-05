"use client"

import { useEffect, useRef, useCallback } from "react"

type ActionType =
  | "page_view"
  | "click"
  | "purchase"
  | "signup"
  | "login"
  | "search"
  | "download"
  | "share"
  | "duration"

type ResourceType = "course" | "service" | "product" | "forum_post" | "lesson" | "page"

interface TrackOptions {
  action_type: ActionType
  resource_type?: ResourceType
  resource_id?: string
  resource_slug?: string
  duration_seconds?: number
  metadata?: Record<string, unknown>
}

// 세션 ID 생성/조회
function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("playtart_session_id")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    sessionStorage.setItem("playtart_session_id", sessionId)
  }
  return sessionId
}

export function useActivityTracker() {
  const startTime = useRef<number>(Date.now())
  const hasTrackedView = useRef<boolean>(false)

  const track = useCallback(async (options: TrackOptions) => {
    try {
      const sessionId = getSessionId()

      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...options,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          session_id: sessionId,
        }),
      })
    } catch (error) {
      console.error("Activity tracking failed:", error)
    }
  }, [])

  const trackPageView = useCallback(
    (resource_type: ResourceType, resource_id: string, resource_slug?: string) => {
      if (hasTrackedView.current) return // 중복 호출 방지

      hasTrackedView.current = true
      startTime.current = Date.now()

      track({
        action_type: "page_view",
        resource_type,
        resource_id,
        resource_slug,
      })
    },
    [track]
  )

  // 페이지 이탈 시 체류 시간 기록
  const trackDuration = useCallback(
    (resource_type?: ResourceType, resource_id?: string) => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000)

      // 최소 1초 이상, 최대 30분(1800초) 이하만 기록
      if (duration > 0 && duration < 1800) {
        const data = {
          action_type: "duration" as const,
          duration_seconds: duration,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          session_id: getSessionId(),
          resource_type,
          resource_id,
        }

        // sendBeacon으로 페이지 이탈 시에도 확실히 전송
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon("/api/track", JSON.stringify(data))
        }
      }
    },
    []
  )

  const trackClick = useCallback(
    (element: string, metadata?: Record<string, unknown>) => {
      track({
        action_type: "click",
        metadata: { element, ...metadata },
      })
    },
    [track]
  )

  const trackSearch = useCallback(
    (query: string, results_count?: number) => {
      track({
        action_type: "search",
        metadata: { query, results_count },
      })
    },
    [track]
  )

  const trackPurchase = useCallback(
    (resource_type: ResourceType, resource_id: string, amount: number) => {
      track({
        action_type: "purchase",
        resource_type,
        resource_id,
        metadata: { amount },
      })
    },
    [track]
  )

  // 컴포넌트 언마운트 시 리셋
  useEffect(() => {
    return () => {
      hasTrackedView.current = false
    }
  }, [])

  return {
    track,
    trackPageView,
    trackDuration,
    trackClick,
    trackSearch,
    trackPurchase,
  }
}
