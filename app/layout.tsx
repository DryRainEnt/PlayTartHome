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
    default: "Playtart - 인디게임 스튜디오",
    template: "%s | Playtart",
  },
  description: "러쉬걸 루카를 만드는 인디게임 스튜디오 플레이타르트. 게임 개발·픽셀아트 강의.",
  keywords: ["플레이타르트", "Playtart", "러쉬걸 루카", "RushGirl LUCA", "인디게임", "픽셀아트", "게임 개발 강의", "픽셀아트 강의"],
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
    title: "Playtart - 인디게임 스튜디오",
    description: "러쉬걸 루카를 만드는 인디게임 스튜디오 플레이타르트. 게임 개발·픽셀아트 강의.",
    images: [
      {
        url: "/games/luca/capsule.jpg",
        width: 616,
        height: 353,
        alt: "RushGirl LUCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playtart - 인디게임 스튜디오",
    description: "러쉬걸 루카를 만드는 인디게임 스튜디오 플레이타르트.",
    images: ["/games/luca/capsule.jpg"],
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
