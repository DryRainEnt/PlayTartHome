"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          Playtart
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/course" className="text-sm font-medium transition-colors hover:text-primary">
            강의
          </Link>
          <Link href="/outsourcing" className="text-sm font-medium transition-colors hover:text-primary">
            아웃소싱
          </Link>
          <Link href="/forum" className="text-sm font-medium transition-colors hover:text-primary">
            커뮤니티
          </Link>
          <Link href="/feedback" className="text-sm font-medium transition-colors hover:text-primary">
            피드백
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/my-page">마이페이지</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
