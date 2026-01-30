import { createClient } from "@/lib/supabase/server"

export interface GeneralSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  logoUrl: string
}

export interface SeoSettings {
  metaTitle: string
  metaDescription: string
  ogImage: string
}

export interface SocialSettings {
  twitter: string
  instagram: string
  youtube: string
  discord: string
}

export interface SiteSettings {
  general: GeneralSettings
  seo: SeoSettings
  social: SocialSettings
}

const defaultSettings: SiteSettings = {
  general: {
    siteName: "Playtart",
    siteDescription: "게임 개발과 아트를 위한 플랫폼",
    contactEmail: "",
    logoUrl: "",
  },
  seo: {
    metaTitle: "Playtart - 게임 개발 & 아트",
    metaDescription: "게임 개발, 아트 강의, 외주 서비스를 제공하는 플랫폼",
    ogImage: "",
  },
  social: {
    twitter: "",
    instagram: "",
    youtube: "",
    discord: "",
  },
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")

  if (error || !data) {
    return defaultSettings
  }

  const settings: SiteSettings = { ...defaultSettings }

  for (const row of data) {
    if (row.key === "general") {
      settings.general = { ...defaultSettings.general, ...row.value }
    } else if (row.key === "seo") {
      settings.seo = { ...defaultSettings.seo, ...row.value }
    } else if (row.key === "social") {
      settings.social = { ...defaultSettings.social, ...row.value }
    }
  }

  return settings
}

export async function updateSiteSettings(
  key: "general" | "seo" | "social",
  value: GeneralSettings | SeoSettings | SocialSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
