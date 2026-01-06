"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Bell, MessageCircle, Menu, User as UserIcon } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        setIsAdmin(profile?.role === "admin")
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/course", label: "강의" },
    { href: "/outsourcing", label: "외주" },
    { href: "/product", label: "제품" },
    { href: "/forum", label: "게시판" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-1 min-w-[160px]">
          <img src="/PlayTartSplash2.png" alt="Playtart Icon" className="h-12 w-12" />
          <img src="/PlayTartSplash1.png" alt="Playtart" className="h-12 hidden sm:block" />
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측 아이콘/버튼 영역 */}
        <div className="flex items-center gap-1 min-w-[160px] justify-end">
          {user ? (
            <>
              {/* 알림 아이콘 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* 알림 뱃지 (나중에 동적으로) */}
                    {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] text-accent-foreground flex items-center justify-center">3</span> */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>알림</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    새로운 알림이 없습니다
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 메시지 아이콘 */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/messages">
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </Button>

              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-page">마이페이지</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">메시지</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">관리자</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/my-page?tab=settings">설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">회원가입</Link>
              </Button>
            </>
          )}

          {/* 모바일 햄버거 메뉴 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-6 py-3 text-lg font-medium transition-colors hover:text-primary hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t mt-4 pt-4 px-6">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/my-page"
                        className="py-2 text-lg font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="py-2 text-lg font-medium hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          관리자
                        </Link>
                      )}
                      <Button variant="outline" onClick={handleLogout} className="w-full mt-2">
                        로그아웃
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/auth/login"
                        className="py-2 text-lg font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        로그인
                      </Link>
                      <Button asChild className="w-full mt-2">
                        <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          회원가입
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
