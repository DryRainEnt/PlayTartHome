import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CourseForm } from "./course-form"
import { CurriculumEditor } from "./curriculum-editor"

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
  let sections: any[] = []

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

    // Fetch sections with lessons
    const { data: sectionsData } = await supabase
      .from("course_sections")
      .select(`
        *,
        lessons:course_lessons(*)
      `)
      .eq("course_id", id)
      .order("order_index")

    if (sectionsData) {
      sections = sectionsData.map(section => ({
        ...section,
        lessons: section.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [],
      }))
    }
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

      <div className="space-y-6">
        <CourseForm course={course} categories={categories || []} />

        {/* 기존 강의인 경우에만 커리큘럼 편집 표시 */}
        {course && (
          <CurriculumEditor courseId={course.id} initialSections={sections} />
        )}
      </div>
    </div>
  )
}
