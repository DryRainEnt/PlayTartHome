import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrganizationJsonLd } from "@/components/json-ld"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://play-t.art"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Playtart - 픽셀아트 강의 & 외주 플랫폼",
    template: "%s | Playtart",
  },
  description: "픽셀아트, AI 웹사이트 제작, 창작자 생존 전략을 배우고, 게임 리소스 외주까지. 개인 창작자 중심의 미니 플랫폼.",
  keywords: ["픽셀아트", "pixel art", "인디게임", "게임 외주", "픽셀아트 강의", "게임 리소스", "도트 그래픽"],
  authors: [{ name: "Playtart" }],
  creator: "Playtart",
  icons: {
    icon: "/PlayTartSplash2.png",
    apple: "/PlayTartSplash2.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "Playtart",
    title: "Playtart - 픽셀아트 강의 & 외주 플랫폼",
    description: "픽셀아트, AI 웹사이트 제작, 창작자 생존 전략을 배우고, 게임 리소스 외주까지. 개인 창작자 중심의 미니 플랫폼.",
    images: [
      {
        url: "/PlayTartSplash2.png",
        width: 512,
        height: 512,
        alt: "Playtart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playtart - 픽셀아트 강의 & 외주 플랫폼",
    description: "픽셀아트, AI 웹사이트 제작, 창작자 생존 전략을 배우고, 게임 리소스 외주까지.",
    images: ["/PlayTartSplash2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증 후 추가
    // google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
