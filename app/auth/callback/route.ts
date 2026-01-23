import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// 허용된 리다이렉트 경로 검증
function isValidRedirectPath(path: string): boolean {
  // 반드시 /로 시작해야 함 (상대 경로)
  if (!path.startsWith("/")) return false
  // //로 시작하면 프로토콜 상대 URL로 외부 사이트 가능
  if (path.startsWith("//")) return false
  // URL 인코딩된 문자로 우회 시도 방지
  try {
    const decoded = decodeURIComponent(path)
    if (decoded.startsWith("//") || decoded.includes("://")) return false
  } catch {
    return false
  }
  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? "/my-page"

  // 안전한 리다이렉트 경로만 허용
  const next = isValidRedirectPath(nextParam) ? nextParam : "/my-page"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/error?message=소셜 로그인에 실패했습니다`)
}
