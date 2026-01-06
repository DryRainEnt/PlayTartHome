"use client"

import { useEffect, useRef } from "react"
import { useActivityTracker } from "@/hooks/use-activity-tracker"

type ResourceType = "course" | "service" | "product" | "forum_post" | "lesson" | "page"

interface PageViewTrackerProps {
  resourceType?: ResourceType
  resourceId?: string
  resourceSlug?: string
  pageName?: string // 일반 페이지용 (랜딩, 목록 등)
}

export function PageViewTracker({
  resourceType = "page",
  resourceId,
  resourceSlug,
  pageName
}: PageViewTrackerProps) {
  const { track, trackDuration } = useActivityTracker()
  const hasTracked = useRef(false)

  useEffect(() => {
    // 이미 추적했으면 스킵 (Strict Mode 대응)
    if (hasTracked.current) return
    hasTracked.current = true

    // 페이지 조회 기록
    track({
      action_type: "page_view",
      resource_type: resourceType,
      resource_id: resourceId,
      resource_slug: resourceSlug || pageName,
      metadata: pageName ? { page_name: pageName } : undefined,
    })

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
  }, [resourceType, resourceId, resourceSlug, pageName, track, trackDuration])

  return null // 렌더링 없음
}
