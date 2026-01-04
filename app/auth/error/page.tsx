import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">오류가 발생했습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">에러 코드: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">알 수 없는 오류가 발생했습니다.</p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">로그인 페이지로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
