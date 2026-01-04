"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PostActionsProps {
  postId: string
  userId?: string
  userLiked: boolean
  likeCount: number
}

export function PostActions({ postId, userId, userLiked, likeCount }: PostActionsProps) {
  const [liked, setLiked] = useState(userLiked)
  const [count, setCount] = useState(likeCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      if (liked) {
        // Unlike
        await supabase.from("forum_post_likes").delete().eq("post_id", postId).eq("user_id", userId)

        await supabase
          .from("forum_posts")
          .update({ like_count: count - 1 })
          .eq("id", postId)

        setLiked(false)
        setCount(count - 1)
      } else {
        // Like
        await supabase.from("forum_post_likes").insert({
          post_id: postId,
          user_id: userId,
        })

        await supabase
          .from("forum_posts")
          .update({ like_count: count + 1 })
          .eq("id", postId)

        setLiked(true)
        setCount(count + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-t pt-4">
      <Button variant={liked ? "default" : "outline"} onClick={handleLike} disabled={isLoading}>
        👍 좋아요 {count}
      </Button>
    </div>
  )
}
