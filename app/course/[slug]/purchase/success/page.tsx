import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PurchaseSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    redirect("/course")
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">결제가 완료되었습니다</CardTitle>
            <CardDescription>강의를 시작할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground">강사: {course.instructor_name}</p>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" asChild>
                <Link href={`/course/${slug}/learn`}>강의 시작하기</Link>
              </Button>
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/my-page">마이페이지로 이동</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
