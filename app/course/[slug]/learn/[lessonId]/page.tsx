import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CoursePlayer } from "@/components/course-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
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

  // Fetch lesson
  const { data: lesson } = await supabase.from("course_lessons").select("*").eq("id", lessonId).single()

  if (!lesson) {
    redirect(`/course/${slug}/learn`)
  }

  // Fetch all sections and lessons
  const { data: sections } = await supabase
    .from("course_sections")
    .select("*, lessons:course_lessons(*)")
    .eq("course_id", course.id)
    .order("order_index")

  // Get user progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single()

  return (
    <CoursePlayer
      course={course}
      currentLesson={lesson}
      sections={sections || []}
      userId={user.id}
      initialProgress={progress}
    />
  )
}
