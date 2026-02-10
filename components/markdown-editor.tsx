"use client"

import { useState } from "react"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import {
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Image,
  Code,
  Braces,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit,
} from "lucide-react"

interface MarkdownEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = "마크다운 문법을 사용할 수 있습니다.",
  rows = 10,
  label,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write")

  const insertMarkdown = (before: string, after: string = "", placeholderText: string = "") => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholderText
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const toolbarItems = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "굵은 텍스트"), title: "굵게" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "기울임 텍스트"), title: "기울임" },
    { icon: Heading2, action: () => insertMarkdown("## ", "", "제목"), title: "제목" },
    { icon: LinkIcon, action: () => insertMarkdown("[", "](URL)", "링크 텍스트"), title: "링크" },
    { icon: Image, action: () => insertMarkdown("![", "](이미지URL)", "대체 텍스트"), title: "이미지" },
    { icon: Code, action: () => insertMarkdown("`", "`", "코드"), title: "인라인 코드" },
    { icon: Braces, action: () => insertMarkdown("\n```\n", "\n```\n", "코드 블록"), title: "코드 블록" },
    { icon: List, action: () => insertMarkdown("\n- ", "", "목록 항목"), title: "목록" },
    { icon: ListOrdered, action: () => insertMarkdown("\n1. ", "", "목록 항목"), title: "순서 목록" },
    { icon: Quote, action: () => insertMarkdown("\n> ", "", "인용문"), title: "인용" },
  ]

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

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

          {activeTab === "write" && (
            <div className="flex items-center gap-0.5 flex-wrap">
              {toolbarItems.map((item) => (
                <Button
                  key={item.title}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={item.action}
                  title={item.title}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="write" className="mt-2">
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            **굵게**, *기울임*, `코드`, [링크](URL), ![이미지](URL) 형식을 사용할 수 있습니다
          </p>
        </TabsContent>

        <TabsContent value="preview" className="mt-2">
          <div
            className="rounded-md border p-4"
            style={{ minHeight: `${rows * 1.5 + 2}rem` }}
          >
            {value ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground">미리보기할 내용이 없습니다</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
