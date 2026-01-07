"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent } from "./ui/card"
import { createClient } from "@/lib/supabase/client"
import { Bell, CheckCircle, Loader2, Mail } from "lucide-react"

interface EmailSubscriptionFormProps {
  type: "new_course" | "new_service" | "newsletter"
  userEmail?: string
  subscriberCount?: number
  hasContent?: boolean // 콘텐츠가 이미 있는 경우
}

const typeConfig = {
  new_course: {
    title: "준비 중인 강의가 곧 공개됩니다!",
    titleAlt: "찾으시는 강의가 없다면?",
    subtitle: "새 강의를 가장 먼저 만나보세요",
    subtitleAlt: "새 강의가 등록되면 알림을 받아보세요",
    buttonText: "강의 알림 신청",
    successText: "새 강의가 등록되면 알려드릴게요!",
    icon: "📚",
  },
  new_service: {
    title: "새로운 외주 서비스가 준비 중입니다!",
    titleAlt: "찾으시는 서비스가 없다면?",
    subtitle: "새 서비스를 가장 먼저 확인하세요",
    subtitleAlt: "새 서비스가 등록되면 알림을 받아보세요",
    buttonText: "서비스 알림 신청",
    successText: "새 서비스가 등록되면 알려드릴게요!",
    icon: "🎨",
  },
  newsletter: {
    title: "Playtart 소식을 받아보세요",
    titleAlt: "Playtart 소식을 받아보세요",
    subtitle: "유용한 정보와 업데이트를 전달해드립니다",
    subtitleAlt: "유용한 정보와 업데이트를 전달해드립니다",
    buttonText: "뉴스레터 구독",
    successText: "뉴스레터 구독이 완료되었습니다!",
    icon: "📮",
  },
}

export function EmailSubscriptionForm({
  type,
  userEmail,
  subscriberCount,
  hasContent = false,
}: EmailSubscriptionFormProps) {
  const [email, setEmail] = useState(userEmail || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const config = typeConfig[type]
  const title = hasContent ? config.titleAlt : config.title
  const subtitle = hasContent ? config.subtitleAlt : config.subtitle

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const emailToSubscribe = email.trim().toLowerCase()

    if (!emailToSubscribe || !emailToSubscribe.includes("@")) {
      setError("올바른 이메일을 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from("email_subscriptions")
        .insert({
          email: emailToSubscribe,
          subscription_type: type,
          user_id: user?.id || null,
        })

      if (insertError) {
        // Check for duplicate
        if (insertError.code === "23505") {
          setError("이미 알림을 신청하셨습니다")
        } else {
          throw insertError
        }
        return
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알림 신청에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-800 dark:text-green-200">
            알림 신청 완료!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            {config.successText}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">{config.icon}</span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold">{title}</h3>
          <p className="mb-6 text-muted-foreground">{subtitle}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{config.buttonText}</span>
                    <span className="sm:hidden">신청</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </form>

          {/* Subscriber count */}
          {subscriberCount !== undefined && subscriberCount > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-primary">{subscriberCount.toLocaleString()}명</span>이 알림을 신청했어요
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
