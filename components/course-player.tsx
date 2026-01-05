"use client"

import { useState, useEffect, useMemo } from "react"
import { VideoPlayer } from "./video-player"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { ScrollArea } from "./ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Circle,
  PlayCircle,
  List,
  Home,
} from "lucide-react"

interface CoursePlayerProps {
  course: any
  currentLesson: any
  sections: any[]
  userId: string
  initialProgress: any
}

export function CoursePlayer({ course, currentLesson, sections, userId, initialProgress }: CoursePlayerProps) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(initialProgress?.is_completed || false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  // Fetch all lesson progress
  useEffect(() => {
    const fetchProgress = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed")
        .eq("user_id", userId)
        .eq("course_id", course.id)
        .eq("is_completed", true)

      if (data) {
        setCompletedLessons(new Set(data.map((p) => p.lesson_id)))
      }
    }
    fetchProgress()
  }, [userId, course.id, supabase])

  // Flatten all lessons for navigation
  const allLessons = useMemo(() => {
    const lessons: any[] = []
    sections.forEach((section) => {
      section.lessons
        ?.sort((a: any, b: any) => a.order_index - b.order_index)
        .forEach((lesson: any) => {
          lessons.push({ ...lesson, sectionTitle: section.title })
        })
    })
    return lessons
  }, [sections])

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Calculate progress
  const totalLessons = allLessons.length
  const completedCount = completedLessons.size + (isCompleted && !completedLessons.has(currentLesson.id) ? 1 : 0)
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const handleTimeUpdate = async (currentTime: number) => {
    // Update watch time every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      await supabase
        .from("lesson_progress")
        .upsert({
          user_id: userId,
          lesson_id: currentLesson.id,
          course_id: course.id,
          watch_time: Math.floor(currentTime),
          last_watched_at: new Date().toISOString(),
        })
        .select()
    }
  }

  const handleMarkComplete = async () => {
    await supabase
      .from("lesson_progress")
      .upsert({
        user_id: userId,
        lesson_id: currentLesson.id,
        course_id: course.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .select()

    setIsCompleted(true)
    setCompletedLessons((prev) => new Set([...prev, currentLesson.id]))
  }

  const handleVideoEnded = async () => {
    await handleMarkComplete()
    // Auto-navigate to next lesson after a short delay
    if (nextLesson) {
      setTimeout(() => {
        router.push(`/course/${course.slug}/learn/${nextLesson.id}`)
      }, 1500)
    }
  }

  const navigateToLesson = (lessonId: string) => {
    setMobileSheetOpen(false)
    router.push(`/course/${course.slug}/learn/${lessonId}`)
  }

  const LessonList = () => (
    <div className="space-y-4">
      {/* Progress */}
      <div className="px-4 py-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">진행률</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{totalLessons} 완료</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sections & Lessons */}
      {sections.map((section) => (
        <div key={section.id}>
          <h3 className="mb-2 px-1 font-semibold text-sm">{section.title}</h3>
          <div className="space-y-1">
            {section.lessons
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((lesson: any) => {
                const isActive = lesson.id === currentLesson.id
                const isLessonCompleted = completedLessons.has(lesson.id) || (isActive && isCompleted)

                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigateToLesson(lesson.id)}
                    className={`w-full text-left rounded-lg p-3 transition-colors ${
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {isLessonCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isActive ? (
                          <PlayCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
                          {lesson.title}
                        </p>
                        {lesson.video_duration && (
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(lesson.video_duration / 60)}분 {lesson.video_duration % 60}초
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/course/${course.slug}`}>
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-medium line-clamp-1">{course.title}</h1>
            <p className="text-xs text-muted-foreground line-clamp-1">{currentLesson.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress badge */}
          <Badge variant="secondary" className="hidden sm:flex">
            {progressPercent}% 완료
          </Badge>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="hidden md:flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            {showSidebar ? "목록 숨기기" : "목록 보기"}
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>강의 목록</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-60px)] p-4">
                <LessonList />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black">
            {currentLesson.video_url ? (
              <VideoPlayer
                src={currentLesson.video_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                initialTime={initialProgress?.watch_time || 0}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                동영상을 불러올 수 없습니다
              </div>
            )}
          </div>

          {/* Lesson info & navigation */}
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
              {/* Lesson title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {isCompleted && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      완료됨
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {!isCompleted && (
                  <Button onClick={handleMarkComplete}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    완료로 표시
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t pt-6">
                {prevLesson ? (
                  <Button variant="outline" asChild>
                    <Link href={`/course/${course.slug}/learn/${prevLesson.id}`}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">이전: </span>
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{prevLesson.title}</span>
                    </Link>
                  </Button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/course/${course.slug}/learn/${nextLesson.id}`}>
                      <span className="hidden sm:inline">다음: </span>
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{nextLesson.title}</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href={`/course/${course.slug}`}>
                      강의 홈으로
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className="hidden md:block w-80 border-l overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">강의 목록</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)] p-4">
              <LessonList />
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  )
}
