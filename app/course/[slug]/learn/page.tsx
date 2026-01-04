import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    redirect("/course")
  }

  // Check if user has purchased
  const { data: purchase } = await supabase
    .from("course_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "completed")
    .single()

  if (!purchase) {
    redirect(`/course/${slug}`)
  }

  // Get first lesson
  const { data: firstSection } = await supabase
    .from("course_sections")
    .select("*, lessons:course_lessons(*)")
    .eq("course_id", course.id)
    .order("order_index")
    .limit(1)
    .single()

  if (firstSection && firstSection.lessons && firstSection.lessons.length > 0) {
    redirect(`/course/${slug}/learn/${firstSection.lessons[0].id}`)
  }

  redirect(`/course/${slug}`)
}
