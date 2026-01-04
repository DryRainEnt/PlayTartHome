import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  // Fetch service categories
  const { data: serviceCategories } = await supabase
    .from("service_categories")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              크리에이티브 역량을 키우는
              <br />
              <span className="text-primary">온라인 학습 플랫폼</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              디자인, 영상편집, 3D 모델링 등 실무에 필요한 스킬을 전문가에게 배우세요
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/course">강의 둘러보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/outsourcing">아웃소싱 의뢰하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">인기 강의</h2>
              <p className="mt-2 text-muted-foreground">지금 가장 많은 사람들이 수강하는 강의</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/course">전체보기</Link>
            </Button>
          </div>

          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          강의 이미지
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{course.instructor_name}</span>
                        <span className="text-lg font-bold text-primary">₩{course.price.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">아직 등록된 강의가 없습니다</CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">아웃소싱 서비스</h2>
            <p className="mt-2 text-muted-foreground">전문가에게 프로젝트를 맡기세요</p>
          </div>

          {serviceCategories && serviceCategories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {serviceCategories.map((category) => (
                <Link key={category.id} href={`/outsourcing?category=${category.slug}`}>
                  <Card className="h-full text-center transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                서비스 카테고리를 준비 중입니다
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/outsourcing">모든 서비스 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">지금 바로 시작하세요</h2>
              <p className="mb-8 text-lg">수백 개의 강의와 전문가 서비스가 기다리고 있습니다</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/sign-up">무료로 가입하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
