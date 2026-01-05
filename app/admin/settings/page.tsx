import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">사이트 설정을 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사이트 설정</CardTitle>
          <CardDescription>추후 구현 예정입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            사이트 이름, 로고, SEO 설정 등을 관리할 수 있는 기능이 추가될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
