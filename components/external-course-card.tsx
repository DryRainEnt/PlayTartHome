import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import type { ExternalCourse } from "@/lib/site-content"

export function ExternalCourseCard({ course }: { course: ExternalCourse }) {
  return (
    <a href={course.url} target="_blank" rel="noopener noreferrer" className="group">
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-3">
          <span className="w-fit rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-foreground">
            {course.platform}
          </span>
          <p className="flex-1 font-semibold leading-snug">{course.title}</p>
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{course.meta}</span>
            <span className="flex shrink-0 items-center gap-1 transition-colors group-hover:text-primary">
              보러 가기
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
