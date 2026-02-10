import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductForm } from "./product-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("product_categories")
    .select("*")
    .order("name")

  let product = null
  if (id !== "new") {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) {
      redirect("/admin/products")
    }
    product = data
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {product ? "제품 수정" : "새 제품 추가"}
        </h1>
        <p className="text-muted-foreground">
          {product ? "제품 정보를 수정합니다" : "새로운 디지털 제품을 등록합니다"}
        </p>
      </div>

      <ProductForm product={product} categories={categories || []} />
    </div>
  )
}
