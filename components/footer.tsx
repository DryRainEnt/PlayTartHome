import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">Playtart</h3>
            <p className="text-sm text-muted-foreground">크리에이티브 전문가를 위한 온라인 학습 플랫폼</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/course" className="text-muted-foreground hover:text-primary">
                  강의
                </Link>
              </li>
              <li>
                <Link href="/outsourcing" className="text-muted-foreground hover:text-primary">
                  외주
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-muted-foreground hover:text-primary">
                  제품
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-muted-foreground hover:text-primary">
                  커뮤니티
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/feedback" className="text-muted-foreground hover:text-primary">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">회사</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  회사소개
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Playtart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
