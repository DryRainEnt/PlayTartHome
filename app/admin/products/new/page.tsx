import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "../[id]/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("product_categories")
    .select("*")
    .order("name")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 제품 추가</h1>
        <p className="text-muted-foreground">새로운 디지털 제품을 등록합니다</p>
      </div>

      <ProductForm product={null} categories={categories || []} />
    </div>
  )
}
