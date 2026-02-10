"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { MarkdownEditor } from "@/components/markdown-editor"

interface ProductFormProps {
  product: {
    id: string
    title: string
    slug: string
    description: string | null
    content: string | null
    price: number
    original_price: number | null
    thumbnail_url: string | null
    download_url: string | null
    file_size: string | null
    file_format: string | null
    category_id: string | null
    is_published: boolean
    is_featured: boolean
  } | null
  categories: { id: string; name: string; slug: string }[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: product?.title || "",
    slug: product?.slug || "",
    description: product?.description || "",
    content: product?.content || "",
    price: product?.price || 0,
    original_price: product?.original_price || null,
    thumbnail_url: product?.thumbnail_url || "",
    download_url: product?.download_url || "",
    file_size: product?.file_size || "",
    file_format: product?.file_format || "",
    category_id: product?.category_id || "",
    is_published: product?.is_published || false,
    is_featured: product?.is_featured || false,
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
      slug: product ? prev.slug : generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")

      const data = {
        ...formData,
        category_id: formData.category_id || null,
        original_price: formData.original_price || null,
        download_url: formData.download_url || null,
        file_size: formData.file_size || null,
        file_format: formData.file_format || null,
        seller_id: user.id,
      }

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert(data)

        if (error) throw error
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id)
      if (error) throw error

      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제품 제목 *</Label>
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

              <MarkdownEditor
                id="description"
                label="설명"
                value={formData.description}
                onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                rows={5}
                placeholder="제품에 대한 간단한 설명을 입력하세요"
              />

              <div className="space-y-2">
                <Label>썸네일 이미지</Label>
                <ImageUpload
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url }))}
                  bucket="thumbnails"
                  folder="products"
                  aspectRatio="1/1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>상세 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                id="content"
                value={formData.content}
                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                rows={15}
                placeholder="제품 상세 소개를 마크다운으로 작성하세요"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>제품 정보</CardTitle>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="file_format">파일 포맷</Label>
                  <Input
                    id="file_format"
                    value={formData.file_format}
                    onChange={(e) => setFormData((prev) => ({ ...prev, file_format: e.target.value }))}
                    placeholder="예: PNG, PSD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_size">파일 크기</Label>
                  <Input
                    id="file_size"
                    value={formData.file_size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, file_size: e.target.value }))}
                    placeholder="예: 25MB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="download_url">다운로드 URL</Label>
                <Input
                  id="download_url"
                  type="url"
                  value={formData.download_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, download_url: e.target.value }))}
                  placeholder="구매 후 다운로드할 파일 URL"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>가격</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">판매가 (원) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">정가 (원)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price || ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    original_price: e.target.value ? Number(e.target.value) : null,
                  }))}
                  placeholder="할인 전 가격"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>공개 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_published">공개 상태</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_published ? "사용자에게 공개됩니다" : "비공개 상태입니다"}
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">추천 제품</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_featured ? "메인 페이지에 노출됩니다" : "일반 제품입니다"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "저장 중..." : product ? "수정하기" : "등록하기"}
              </Button>

              {product && (
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
