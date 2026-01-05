import { requireAdmin } from "@/lib/admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, BookOpen, Palette, Users, FileText, Settings, BarChart3 } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  const navItems = [
    { href: "/admin", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
    { href: "/admin/courses", label: "강의 관리", icon: BookOpen },
    { href: "/admin/services", label: "외주 서비스 관리", icon: Palette },
    { href: "/admin/users", label: "사용자 관리", icon: Users },
    { href: "/admin/posts", label: "게시글 관리", icon: FileText },
    { href: "/admin/settings", label: "설정", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4">
        <div className="mb-6">
          <Link href="/admin" className="text-xl font-bold text-primary">
            관리자
          </Link>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">사이트로 돌아가기</Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
