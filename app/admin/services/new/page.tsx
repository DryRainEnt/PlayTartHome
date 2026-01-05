import { createClient } from "@/lib/supabase/server"
import { ServiceForm } from "../[id]/service-form"

export default async function NewServicePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .order("name")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 서비스 추가</h1>
        <p className="text-muted-foreground">새로운 외주 서비스를 등록합니다</p>
      </div>

      <ServiceForm service={null} categories={categories || []} />
    </div>
  )
}
