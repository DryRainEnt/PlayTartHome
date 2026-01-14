"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ServiceFormProps {
  service: {
    id: string
    title: string
    slug: string
    description: string
    price_min: number | null
    price_max: number | null
    category_id: string | null
    thumbnail_url: string | null
    delivery_days: number | null
    is_published: boolean
    external_url: string | null
  } | null
  categories: { id: string; name: string; slug: string }[]
}

export function ServiceForm({ service, categories }: ServiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: service?.title || "",
    slug: service?.slug || "",
    description: service?.description || "",
    price_min: service?.price_min || null,
    price_max: service?.price_max || null,
    category_id: service?.category_id || "",
    thumbnail_url: service?.thumbnail_url || "",
    delivery_days: service?.delivery_days || null,
    is_published: service?.is_published || false,
    external_url: service?.external_url || "",
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: service ? prev.slug : generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user for provider_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")

      const data = {
        ...formData,
        category_id: formData.category_id || null,
        external_url: formData.external_url || null,
        provider_id: user.id,
      }

      if (service) {
        const { error } = await supabase
          .from("services")
          .update(data)
          .eq("id", service.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("services").insert(data)

        if (error) throw error
      }

      router.push("/admin/services")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!service) return
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("services").delete().eq("id", service.id)
      if (error) throw error

      router.push("/admin/services")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">서비스 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">슬러그 (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">썸네일 URL</Label>
                <Input
                  id="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">외부 링크 (선택)</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, external_url: e.target.value }))}
                  placeholder="https://kmong.com/gig/..."
                />
                <p className="text-xs text-muted-foreground">
                  크몽 등 외부 플랫폼 링크. 설정 시 상세 페이지 대신 외부로 이동합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>서비스 상세</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">카테고리</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
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
                <Label htmlFor="delivery_days">작업 기간 (일)</Label>
                <Input
                  id="delivery_days"
                  type="number"
                  value={formData.delivery_days || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    delivery_days: e.target.value ? Number(e.target.value) : null,
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>가격 범위</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price_min">최소 가격 (원)</Label>
                <Input
                  id="price_min"
                  type="number"
                  value={formData.price_min || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    price_min: e.target.value ? Number(e.target.value) : null,
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_max">최대 가격 (원)</Label>
                <Input
                  id="price_max"
                  type="number"
                  value={formData.price_max || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    price_max: e.target.value ? Number(e.target.value) : null,
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>공개 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_published">공개 상태</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formData.is_published ? "사용자에게 공개됩니다" : "비공개 상태입니다"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "저장 중..." : service ? "수정하기" : "등록하기"}
              </Button>

              {service && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  삭제하기
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
