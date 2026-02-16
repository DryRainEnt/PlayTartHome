"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Code, Image, Eye, Edit } from "lucide-react"

interface CreatePostFormProps {
  categories: any[]
  userId: string
}

export function CreatePostForm({ categories, userId }: CreatePostFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("write")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId || null,
          author_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/forum/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  // Simple markdown toolbar actions
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newText)

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  // Simple markdown to HTML converter (basic)
  const renderMarkdown = (text: string) => {
    let html = text
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      // Inline code
      .replace(/`(.*?)`/g, "<code class='inline-code'>$1</code>")
      // Links (block javascript: and data: URLs)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        const trimmed = url.trim().toLowerCase()
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
          return text
        }
        return `<a href="${url}" class="text-primary underline" target="_blank" rel="noopener">${text}</a>`
      })
      // Line breaks
      .replace(/\n/g, "<br>")

    return html
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>내용</Label>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="write" className="gap-2">
                    <Edit className="h-4 w-4" />
                    작성
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    미리보기
                  </TabsTrigger>
                </TabsList>

                {/* Formatting toolbar */}
                {activeTab === "write" && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown("**", "**", "굵은 텍스트")}
                      title="굵게"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown("*", "*", "기울임 텍스트")}
                      title="기울임"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown("[", "](URL)", "링크 텍스트")}
                      title="링크"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown("`", "`", "코드")}
                      title="인라인 코드"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown("\n- ", "", "목록 항목")}
                      title="목록"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="write" className="mt-2">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다."
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  **굵게**, *기울임*, `코드`, [링크](URL) 형식을 사용할 수 있습니다
                </p>
              </TabsContent>

              <TabsContent value="preview" className="mt-2">
                <div className="min-h-[340px] rounded-md border p-4">
                  {content ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                    />
                  ) : (
                    <p className="text-muted-foreground">미리보기할 내용이 없습니다</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "작성 중..." : "작성하기"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
