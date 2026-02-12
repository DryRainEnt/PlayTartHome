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

  // Fetch course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    redirect("/course")
  }

  // Fetch lesson with section to verify it belongs to this course
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("*, section:course_sections!inner(course_id)")
    .eq("id", lessonId)
    .single()

  // Verify lesson exists AND belongs to this course
  if (!lesson || lesson.section?.course_id !== course.id) {
    redirect(`/course/${slug}/learn`)
  }

  // Block access to unpublished lessons
  if (lesson.is_published === false) {
    redirect(`/course/${slug}/learn`)
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

  // Access control: free lessons are open, paid lessons require purchase
  if (!lesson.is_free && !hasPurchased) {
    redirect(`/course/${slug}`)
  }

  // Fetch all sections and lessons
  const { data: sections } = await supabase
    .from("course_sections")
    .select("*, lessons:course_lessons(*)")
    .eq("course_id", course.id)
    .order("order_index")

  // Get user progress (only if logged in)
  let progress = null
  if (user) {
    const { data } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .single()

    progress = data
  }

  return (
    <CoursePlayer
      course={course}
      currentLesson={lesson}
      sections={sections || []}
      userId={user?.id || null}
      hasPurchased={hasPurchased}
      initialProgress={progress}
    />
  )
}
