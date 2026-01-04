"use client"

import { useState } from "react"
import { VideoPlayer } from "./video-player"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CoursePlayerProps {
  course: any
  currentLesson: any
  sections: any[]
  userId: string
  initialProgress: any
}

export function CoursePlayer({ course, currentLesson, sections, userId, initialProgress }: CoursePlayerProps) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [isCompleted, setIsCompleted] = useState(initialProgress?.is_completed || false)
  const router = useRouter()
  const supabase = createClient()

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
  }

  const handleVideoEnded = async () => {
    await handleMarkComplete()
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Link href={`/course/${course.slug}`} className="text-lg font-bold">
          {course.title}
        </Link>
        <Button variant="ghost" onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? "강의 목록 숨기기" : "강의 목록 보기"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Player */}
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex-1 bg-black">
            {currentLesson.video_url ? (
              <VideoPlayer
                src={currentLesson.video_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                initialTime={initialProgress?.watch_time || 0}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">동영상을 불러올 수 없습니다</div>
            )}
          </div>

          <div className="border-t p-6">
            <h1 className="mb-2 text-2xl font-bold">{currentLesson.title}</h1>
            {currentLesson.description && <p className="mb-4 text-muted-foreground">{currentLesson.description}</p>}

            {!isCompleted && (
              <Button onClick={handleMarkComplete} className="mt-4">
                완료로 표시
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 overflow-auto border-l">
            <div className="p-4">
              <h2 className="mb-4 text-lg font-bold">강의 목록</h2>
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id}>
                    <h3 className="mb-2 font-semibold">{section.title}</h3>
                    <div className="space-y-1">
                      {section.lessons?.map((lesson: any) => (
                        <Link key={lesson.id} href={`/course/${course.slug}/learn/${lesson.id}`}>
                          <Card
                            className={`cursor-pointer p-3 transition-colors hover:bg-muted ${
                              lesson.id === currentLesson.id ? "border-primary bg-muted" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <svg
                                className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <div className="flex-1 text-sm">
                                <p className="font-medium">{lesson.title}</p>
                                {lesson.video_duration && (
                                  <p className="text-xs text-muted-foreground">
                                    {Math.floor(lesson.video_duration / 60)}분
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
