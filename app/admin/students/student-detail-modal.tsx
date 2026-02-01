"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, CheckCircle, Circle, Clock, Loader2 } from "lucide-react"

interface StudentDetailModalProps {
  odUserId: string
  courseId: string
  userName: string
  courseTitle: string
}

interface LessonProgress {
  lessonId: string
  lessonTitle: string
  sectionTitle: string
  isCompleted: boolean
  watchTime: number
  lastWatched: string | null
}

export function StudentDetailModal({
  odUserId,
  courseId,
  userName,
  courseTitle,
}: StudentDetailModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [totalWatchTime, setTotalWatchTime] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    if (!open) return

    const fetchProgress = async () => {
      setLoading(true)

      // Get course sections and lessons
      const { data: sections } = await supabase
        .from("course_sections")
        .select(`
          id,
          title,
          order_index,
          lessons:course_lessons(id, title, order_index, is_published)
        `)
        .eq("course_id", courseId)
        .order("order_index")

      // Get user's progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, watch_time, last_watched_at")
        .eq("user_id", odUserId)
        .eq("course_id", courseId)

      const progressMap = new Map(
        progressData?.map((p) => [
          p.lesson_id,
          { isCompleted: p.is_completed, watchTime: p.watch_time || 0, lastWatched: p.last_watched_at },
        ])
      )

      // Build lesson list with progress
      const lessonList: LessonProgress[] = []
      let totalTime = 0

      sections?.forEach((section) => {
        const lessons = section.lessons as any[]
        lessons
          ?.filter((l) => l.is_published !== false)
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((lesson) => {
            const prog = progressMap.get(lesson.id)
            totalTime += prog?.watchTime || 0
            lessonList.push({
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              sectionTitle: section.title,
              isCompleted: prog?.isCompleted || false,
              watchTime: prog?.watchTime || 0,
              lastWatched: prog?.lastWatched || null,
            })
          })
      })

      setProgress(lessonList)
      setTotalWatchTime(totalTime)
      setLoading(false)
    }

    fetchProgress()
  }, [open, odUserId, courseId, supabase])

  const completedCount = progress.filter((p) => p.isCompleted).length
  const progressPercent = progress.length > 0 ? Math.round((completedCount / progress.length) * 100) : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          상세
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{userName}님의 수강 현황</DialogTitle>
          <DialogDescription>{courseTitle}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">진도율</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">
                  {completedCount}/{progress.length}
                </p>
                <p className="text-xs text-muted-foreground">완료 레슨</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{formatTime(totalWatchTime)}</p>
                <p className="text-xs text-muted-foreground">총 시청</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>전체 진도</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    progressPercent === 100 ? "bg-green-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Lesson list */}
            <div>
              <h4 className="font-medium mb-2">레슨별 진도</h4>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {progress.map((lesson, index) => {
                    const prevSection = index > 0 ? progress[index - 1].sectionTitle : null
                    const showSectionHeader = lesson.sectionTitle !== prevSection

                    return (
                      <div key={lesson.lessonId}>
                        {showSectionHeader && (
                          <p className="text-xs font-medium text-muted-foreground mt-3 mb-1">
                            {lesson.sectionTitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                          {lesson.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : lesson.watchTime > 0 ? (
                            <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{lesson.lessonTitle}</p>
                            {lesson.watchTime > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {formatTime(lesson.watchTime)} 시청
                                {lesson.lastWatched && (
                                  <span className="ml-2">
                                    · {new Date(lesson.lastWatched).toLocaleDateString("ko-KR")}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          {lesson.isCompleted && (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              완료
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
