import { requireAdmin } from "@/lib/admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminNavLinks } from "@/components/admin/admin-sidebar"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <AdminMobileNav />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 p-4">
        <div className="mb-6">
          <Link href="/admin" className="text-xl font-bold text-primary">
            관리자
          </Link>
        </div>
        <AdminNavLinks />
        <div className="mt-8 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">사이트로 돌아가기</Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  )
}
