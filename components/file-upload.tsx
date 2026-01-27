"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Upload, X, Loader2, FileIcon, Download } from "lucide-react"

interface Attachment {
  name: string
  url: string
  size: number
}

interface FileUploadProps {
  value: Attachment[]
  onChange: (attachments: Attachment[]) => void
  bucket: string
  folder: string
  maxFiles?: number
  maxSizeMB?: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({
  value = [],
  onChange,
  bucket,
  folder,
  maxFiles = 5,
  maxSizeMB = 50,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (files: FileList) => {
    if (value.length + files.length > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드 가능합니다`)
      return
    }

    setIsUploading(true)
    setError(null)

    const newAttachments: Attachment[] = []

    for (const file of Array.from(files)) {
      // 파일 크기 체크
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다`)
        continue
      }

      try {
        // 파일명 생성 (한글 등 특수문자 제거, 중복 방지)
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "file"
        const randomId = Math.random().toString(36).substring(2, 10)
        const fileName = `${Date.now()}-${randomId}.${fileExt}`
        const filePath = `${folder}/${fileName}`

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        // URL 생성 (비공개 버킷이므로 signed URL 사용)
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        newAttachments.push({
          name: file.name,
          url: filePath, // 경로만 저장 (다운로드 시 signed URL 생성)
          size: file.size,
        })
      } catch (err) {
        console.error("Upload error:", err)
        setError(err instanceof Error ? err.message : "업로드에 실패했습니다")
      }
    }

    if (newAttachments.length > 0) {
      onChange([...value, ...newAttachments])
    }

    setIsUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleUpload(files)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemove = async (index: number) => {
    const attachment = value[index]

    // Storage에서 삭제
    try {
      await supabase.storage.from(bucket).remove([attachment.url])
    } catch (err) {
      console.error("Delete error:", err)
    }

    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 파일 목록 */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼 */}
      {value.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              첨부파일 추가 ({value.length}/{maxFiles})
            </>
          )}
        </Button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        최대 {maxFiles}개, 파일당 {maxSizeMB}MB까지
      </p>
    </div>
  )
}

// 다운로드용 컴포넌트 (학습 페이지에서 사용)
interface AttachmentListProps {
  attachments: Attachment[]
  courseId: string
}

export function AttachmentList({ attachments, courseId }: AttachmentListProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const supabase = createClient()

  const handleDownload = async (attachment: Attachment) => {
    setDownloading(attachment.url)

    try {
      // Signed URL 생성 (1시간 유효)
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(attachment.url, 3600)

      if (error) throw error

      // 다운로드
      const link = document.createElement("a")
      link.href = data.signedUrl
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download error:", err)
      alert("다운로드에 실패했습니다")
    } finally {
      setDownloading(null)
    }
  }

  if (!attachments || attachments.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">첨부파일</h3>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <button
            key={index}
            onClick={() => handleDownload(attachment)}
            disabled={downloading === attachment.url}
            className="flex items-center gap-3 w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
          >
            {downloading === attachment.url ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
            ) : (
              <Download className="h-5 w-5 text-primary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
