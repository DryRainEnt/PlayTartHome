import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ServiceForm } from "./service-form"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .order("name")

  let service = null
  if (id !== "new") {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) {
      redirect("/admin/services")
    }
    service = data
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {service ? "서비스 수정" : "새 서비스 추가"}
        </h1>
        <p className="text-muted-foreground">
          {service ? "서비스 정보를 수정합니다" : "새로운 외주 서비스를 등록합니다"}
        </p>
      </div>

      <ServiceForm service={service} categories={categories || []} />
    </div>
  )
}
