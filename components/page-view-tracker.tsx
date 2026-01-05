"use client"

import { useEffect, useRef } from "react"
import { useActivityTracker } from "@/hooks/use-activity-tracker"

type ResourceType = "course" | "service" | "product" | "forum_post" | "lesson" | "page"

interface PageViewTrackerProps {
  resourceType: ResourceType
  resourceId: string
  resourceSlug?: string
}

export function PageViewTracker({ resourceType, resourceId, resourceSlug }: PageViewTrackerProps) {
  const { trackPageView, trackDuration } = useActivityTracker()
  const hasTracked = useRef(false)

  useEffect(() => {
    // 이미 추적했으면 스킵 (Strict Mode 대응)
    if (hasTracked.current) return
    hasTracked.current = true

    // 페이지 조회 기록
    trackPageView(resourceType, resourceId, resourceSlug)

    // 페이지 이탈 시 체류 시간 기록
    const handleBeforeUnload = () => {
      trackDuration(resourceType, resourceId)
    }

    // visibilitychange로 탭 전환 시에도 기록
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackDuration(resourceType, resourceId)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // 컴포넌트 언마운트 시에도 기록 (SPA 내부 이동)
      trackDuration(resourceType, resourceId)
    }
  }, [resourceType, resourceId, resourceSlug, trackPageView, trackDuration])

  return null // 렌더링 없음
}
