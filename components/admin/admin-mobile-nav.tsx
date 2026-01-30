"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { AdminNavLinks } from "./admin-sidebar"

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
      <Link href="/admin" className="text-xl font-bold text-primary">
        관리자
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>관리자 메뉴</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <AdminNavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-8 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/" onClick={() => setOpen(false)}>
                  사이트로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
