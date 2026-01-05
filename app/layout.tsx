import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Playtart - 픽셀아트 강의 & 외주 플랫폼",
  description: "픽셀아트, AI 웹사이트 제작, 창작자 생존 전략을 배우고, 게임 리소스 외주까지. 개인 창작자 중심의 미니 플랫폼.",
  icons: {
    icon: "/PlayTartSplash2.png",
    apple: "/PlayTartSplash2.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
