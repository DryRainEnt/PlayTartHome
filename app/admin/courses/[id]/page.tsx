import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CourseForm } from "./course-form"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from("course_categories")
    .select("*")
    .order("name")

  // Fetch course if editing
  let course = null
  if (id !== "new") {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) {
      redirect("/admin/courses")
    }
    course = data
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {course ? "강의 수정" : "새 강의 추가"}
        </h1>
        <p className="text-muted-foreground">
          {course ? "강의 정보를 수정합니다" : "새로운 강의를 등록합니다"}
        </p>
      </div>

      <CourseForm course={course} categories={categories || []} />
    </div>
  )
}
