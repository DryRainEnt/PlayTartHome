"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Video, Paperclip } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

interface Attachment {
  name: string
  url: string
  size: number
}

interface Lesson {
  id?: string
  title: string
  description?: string
  video_url?: string
  video_duration?: number
  order_index: number
  is_free: boolean
  is_published: boolean
  attachments: Attachment[]
  isNew?: boolean
}

interface Section {
  id?: string
  title: string
  order_index: number
  lessons: Lesson[]
  isNew?: boolean
  isExpanded?: boolean
}

interface CurriculumEditorProps {
  courseId: string
  initialSections: Section[]
}

export function CurriculumEditor({ courseId, initialSections }: CurriculumEditorProps) {
  const [sections, setSections] = useState<Section[]>(
    initialSections.map(s => ({ ...s, isExpanded: true }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `섹션 ${sections.length + 1}`,
        order_index: sections.length,
        lessons: [],
        isNew: true,
        isExpanded: true,
      },
    ])
  }

  const updateSection = (index: number, updates: Partial<Section>) => {
    setSections(sections.map((s, i) => (i === index ? { ...s, ...updates } : s)))
  }

  const removeSection = (index: number) => {
    if (!confirm("이 섹션과 포함된 모든 레슨을 삭제하시겠습니까?")) return
    setSections(sections.filter((_, i) => i !== index))
  }

  const addLesson = (sectionIndex: number) => {
    const section = sections[sectionIndex]
    const newLesson: Lesson = {
      title: `레슨 ${section.lessons.length + 1}`,
      order_index: section.lessons.length,
      is_free: false,
      is_published: true,
      attachments: [],
      isNew: true,
    }
    updateSection(sectionIndex, {
      lessons: [...section.lessons, newLesson],
    })
  }

  const updateLesson = (sectionIndex: number, lessonIndex: number, updates: Partial<Lesson>) => {
    const section = sections[sectionIndex]
    const updatedLessons = section.lessons.map((l, i) =>
      i === lessonIndex ? { ...l, ...updates } : l
    )
    updateSection(sectionIndex, { lessons: updatedLessons })
  }

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const section = sections[sectionIndex]
    updateSection(sectionIndex, {
      lessons: section.lessons.filter((_, i) => i !== lessonIndex),
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // 1. 기존 섹션/레슨 삭제 (간단한 구현을 위해 전체 삭제 후 재생성)
      await supabase.from("course_lessons").delete().eq("course_id", courseId)
      await supabase.from("course_sections").delete().eq("course_id", courseId)

      // 2. 새 섹션 생성
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex]

        const { data: newSection, error: sectionError } = await supabase
          .from("course_sections")
          .insert({
            course_id: courseId,
            title: section.title,
            order_index: sectionIndex,
          })
          .select()
          .single()

        if (sectionError) throw sectionError

        // 3. 해당 섹션의 레슨 생성
        if (section.lessons.length > 0) {
          const lessonsToInsert = section.lessons.map((lesson, lessonIndex) => ({
            course_id: courseId,
            section_id: newSection.id,
            title: lesson.title,
            description: lesson.description || null,
            video_url: lesson.video_url || null,
            video_duration: lesson.video_duration || null,
            order_index: lessonIndex,
            is_free: lesson.is_free,
            is_published: lesson.is_published ?? true,
            attachments: lesson.attachments || [],
          }))

          const { error: lessonsError } = await supabase
            .from("course_lessons")
            .insert(lessonsToInsert)

          if (lessonsError) throw lessonsError
        }
      }

      // 4. 강의의 total_lessons 업데이트
      const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
      await supabase
        .from("courses")
        .update({ total_lessons: totalLessons })
        .eq("id", courseId)

      setSuccessMessage("커리큘럼이 저장되었습니다!")

      // 3초 후 메시지 제거
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "저장에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>커리큘럼</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4 mr-1" />
            섹션 추가
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "저장 중..." : "커리큘럼 저장"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600">
            {successMessage}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>아직 섹션이 없습니다.</p>
            <p className="text-sm">위의 "섹션 추가" 버튼을 클릭해 커리큘럼을 구성하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id || `new-${sectionIndex}`}
                className="border rounded-lg overflow-hidden"
              >
                {/* Section Header */}
                <div className="bg-muted/50 p-3 flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <button
                    type="button"
                    onClick={() => updateSection(sectionIndex, { isExpanded: !section.isExpanded })}
                    className="p-1"
                  >
                    {section.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                    className="flex-1 bg-background"
                    placeholder="섹션 제목"
                  />
                  <span className="text-sm text-muted-foreground">
                    {section.lessons.length}개 레슨
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Section Content (Lessons) */}
                {section.isExpanded && (
                  <div className="p-3 space-y-2">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id || `new-lesson-${lessonIndex}`}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move mt-2" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(sectionIndex, lessonIndex, { title: e.target.value })
                              }
                              className="flex-1"
                              placeholder="레슨 제목"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={lesson.video_url || ""}
                              onChange={(e) =>
                                updateLesson(sectionIndex, lessonIndex, { video_url: e.target.value })
                              }
                              placeholder="영상 URL (YouTube, Vimeo 등)"
                              className="text-sm"
                            />
                            <Input
                              type="number"
                              value={lesson.video_duration || ""}
                              onChange={(e) =>
                                updateLesson(sectionIndex, lessonIndex, {
                                  video_duration: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              placeholder="영상 길이 (초)"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={lesson.is_published ?? true}
                                onCheckedChange={(checked) =>
                                  updateLesson(sectionIndex, lessonIndex, { is_published: checked })
                                }
                              />
                              <Label className="text-sm">{lesson.is_published === false ? "공개 예정" : "공개됨"}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={lesson.is_free}
                                onCheckedChange={(checked) =>
                                  updateLesson(sectionIndex, lessonIndex, { is_free: checked })
                                }
                              />
                              <Label className="text-sm">무료 공개</Label>
                            </div>
                          </div>
                          {/* 첨부파일 */}
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 mb-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-sm">첨부파일</Label>
                            </div>
                            <FileUpload
                              value={lesson.attachments || []}
                              onChange={(attachments) =>
                                updateLesson(sectionIndex, lessonIndex, { attachments })
                              }
                              bucket="attachments"
                              folder={courseId}
                              maxFiles={5}
                              maxSizeMB={50}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLesson(sectionIndex, lessonIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addLesson(sectionIndex)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      레슨 추가
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
