import { getSiteSettings } from "@/lib/site-settings"
import { SettingsForm } from "./settings-form"

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">사이트 설정을 관리합니다</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
