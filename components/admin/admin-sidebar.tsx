import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Palette,
  Users,
  FileText,
  Settings,
  BarChart3,
  Mail,
  ShoppingCart,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
  { href: "/admin/orders", label: "주문 관리", icon: ShoppingCart },
  { href: "/admin/students", label: "수강생 관리", icon: GraduationCap },
  { href: "/admin/courses", label: "강의 관리", icon: BookOpen },
  { href: "/admin/services", label: "외주 서비스 관리", icon: Palette },
  { href: "/admin/subscribers", label: "구독자 관리", icon: Mail },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/posts", label: "게시글 관리", icon: FileText },
  { href: "/admin/settings", label: "설정", icon: Settings },
]

interface AdminNavLinksProps {
  onNavigate?: () => void
}

export function AdminNavLinks({ onNavigate }: AdminNavLinksProps) {
  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className="w-full justify-start gap-2"
          asChild
          onClick={onNavigate}
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
