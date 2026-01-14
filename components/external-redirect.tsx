"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ExternalRedirectProps {
  url: string
}

export function ExternalRedirect({ url }: ExternalRedirectProps) {
  useEffect(() => {
    window.location.href = url
  }, [url])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">외부 페이지로 이동 중...</p>
    </div>
  )
}
