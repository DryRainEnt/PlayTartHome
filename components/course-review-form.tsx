"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Star } from "lucide-react"

interface CourseReviewFormProps {
  courseId: string
  userId: string
  existingReview?: {
    id: string
    rating: number
    content: string
  }
  onSuccess?: () => void
}

export function CourseReviewForm({ courseId, userId, existingReview, onSuccess }: CourseReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState(existingReview?.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (rating === 0) {
      setError("별점을 선택해주세요")
      setIsLoading(false)
      return
    }

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("course_reviews")
          .update({
            rating,
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase
          .from("course_reviews")
          .insert({
            course_id: courseId,
            user_id: userId,
            rating,
            content: content.trim(),
          })

        if (error) throw error
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "리뷰 등록에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
          </div>
          <h3 className="mb-2 text-xl font-bold">
            {existingReview ? "리뷰가 수정되었습니다" : "리뷰가 등록되었습니다"}
          </h3>
          <p className="text-muted-foreground">소중한 리뷰 감사합니다!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReview ? "리뷰 수정" : "강의 리뷰 작성"}</CardTitle>
        <CardDescription>
          이 강의를 수강한 경험을 공유해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">별점</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && "별로예요"}
                    {rating === 2 && "그저 그래요"}
                    {rating === 3 && "보통이에요"}
                    {rating === 4 && "좋아요"}
                    {rating === 5 && "최고예요!"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <label htmlFor="review-content" className="text-sm font-medium">
              리뷰 내용 <span className="text-muted-foreground">(선택)</span>
            </label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="강의에 대한 솔직한 후기를 작성해주세요. 다른 수강생들에게 도움이 됩니다!"
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "등록 중..." : existingReview ? "리뷰 수정" : "리뷰 등록"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
