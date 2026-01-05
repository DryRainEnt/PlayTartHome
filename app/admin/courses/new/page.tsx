import { createClient } from "@/lib/supabase/server"
import { CourseForm } from "../[id]/course-form"

export default async function NewCoursePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("course_categories")
    .select("*")
    .order("name")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 강의 추가</h1>
        <p className="text-muted-foreground">새로운 강의를 등록합니다</p>
      </div>

      <CourseForm course={null} categories={categories || []} />
    </div>
  )
}
