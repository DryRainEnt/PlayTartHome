"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ExternalRedirectProps {
  url: string
}

export function ExternalRedirect({ url }: ExternalRedirectProps) {
  useEffect(() => {
    console.log("ExternalRedirect: redirecting to", url)
    if (url && url.startsWith("http")) {
      window.location.href = url
    } else {
      console.error("ExternalRedirect: invalid URL", url)
    }
  }, [url])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">외부 페이지로 이동 중...</p>
      <p className="text-xs text-muted-foreground font-mono">{url || "(URL 없음)"}</p>
    </div>
  )
}
