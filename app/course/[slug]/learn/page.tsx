import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    redirect("/course")
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user has purchased
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from("course_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("status", "completed")
      .single()

    hasPurchased = !!purchase
  }

  // Get all sections with lessons
  const { data: sections } = await supabase
    .from("course_sections")
    .select("*, lessons:course_lessons(*)")
    .eq("course_id", course.id)
    .order("order_index")

  // Flatten all published lessons in order
  const allLessons: any[] = []
  sections?.forEach((section) => {
    section.lessons
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .filter((l: any) => l.is_published !== false)
      .forEach((l: any) => allLessons.push(l))
  })

  if (hasPurchased) {
    // Purchased user → first lesson (existing behavior)
    if (allLessons.length > 0) {
      redirect(`/course/${slug}/learn/${allLessons[0].id}`)
    }
  } else {
    // Non-purchased / non-logged-in → first free lesson
    const firstFreeLesson = allLessons.find((l) => l.is_free)
    if (firstFreeLesson) {
      redirect(`/course/${slug}/learn/${firstFreeLesson.id}`)
    }
  }

  // Fallback: no lessons or no free lessons → course detail page
  redirect(`/course/${slug}`)
}
