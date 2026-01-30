"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { Loader2 } from "lucide-react"
import type { SiteSettings } from "@/lib/site-settings"

interface SettingsFormProps {
  initialSettings: SiteSettings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const saveSection = async (section: "general" | "seo" | "social") => {
    setSaving(section)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: section, value: settings[section] }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다")
      }

      setSuccess(`${section === "general" ? "일반" : section === "seo" ? "SEO" : "소셜"} 설정이 저장되었습니다`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500 bg-green-500/10 p-4 text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>일반 설정</CardTitle>
          <CardDescription>사이트 기본 정보를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">사이트 이름</Label>
            <Input
              id="siteName"
              value={settings.general.siteName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, siteName: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">사이트 설명</Label>
            <Textarea
              id="siteDescription"
              value={settings.general.siteDescription}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, siteDescription: e.target.value },
                })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">연락처 이메일</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.general.contactEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, contactEmail: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>로고 이미지</Label>
            <ImageUpload
              value={settings.general.logoUrl}
              onChange={(url) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, logoUrl: url },
                })
              }
              bucket="public"
              folder="settings"
              aspectRatio="1/1"
            />
          </div>

          <Button onClick={() => saveSection("general")} disabled={saving !== null}>
            {saving === "general" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            일반 설정 저장
          </Button>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO 설정</CardTitle>
          <CardDescription>검색엔진 최적화 설정입니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">메타 타이틀</Label>
            <Input
              id="metaTitle"
              value={settings.seo.metaTitle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaTitle: e.target.value },
                })
              }
            />
            <p className="text-xs text-muted-foreground">브라우저 탭과 검색 결과에 표시됩니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">메타 설명</Label>
            <Textarea
              id="metaDescription"
              value={settings.seo.metaDescription}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaDescription: e.target.value },
                })
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground">검색 결과에 표시되는 설명입니다 (150자 권장)</p>
          </div>

          <div className="space-y-2">
            <Label>OG 이미지</Label>
            <ImageUpload
              value={settings.seo.ogImage}
              onChange={(url) =>
                setSettings({
                  ...settings,
                  seo: { ...settings.seo, ogImage: url },
                })
              }
              bucket="public"
              folder="settings"
              aspectRatio="1.91/1"
            />
            <p className="text-xs text-muted-foreground">소셜 미디어 공유 시 표시되는 이미지 (1200x630 권장)</p>
          </div>

          <Button onClick={() => saveSection("seo")} disabled={saving !== null}>
            {saving === "seo" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            SEO 설정 저장
          </Button>
        </CardContent>
      </Card>

      {/* Social Settings */}
      <Card>
        <CardHeader>
          <CardTitle>소셜 링크</CardTitle>
          <CardDescription>소셜 미디어 계정 링크를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter (X)</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/username"
              value={settings.social.twitter}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, twitter: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/username"
              value={settings.social.instagram}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, instagram: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/@channel"
              value={settings.social.youtube}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, youtube: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord">Discord</Label>
            <Input
              id="discord"
              placeholder="https://discord.gg/invite"
              value={settings.social.discord}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, discord: e.target.value },
                })
              }
            />
          </div>

          <Button onClick={() => saveSection("social")} disabled={saving !== null}>
            {saving === "social" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            소셜 링크 저장
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
