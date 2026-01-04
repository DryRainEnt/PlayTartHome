import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PurchaseForm } from "@/components/purchase-form"

export default async function PurchasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/course/" + slug + "/purchase")
  }

  // Fetch course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).eq("is_published", true).single()

  if (!course) {
    redirect("/course")
  }

  // Check if already purchased
  const { data: existingPurchase } = await supabase
    .from("course_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "completed")
    .single()

  if (existingPurchase) {
    redirect(`/course/${slug}/learn`)
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">결제하기</h1>
        <PurchaseForm course={course} user={user} profile={profile} />
      </div>
    </div>
  )
}
