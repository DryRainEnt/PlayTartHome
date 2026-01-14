import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductPurchaseForm } from "@/components/product-purchase-form"

export default async function ProductPurchasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/product/" + slug + "/purchase")
  }

  // Fetch product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!product) {
    redirect("/product")
  }

  // Check if already purchased
  const { data: existingPurchase } = await supabase
    .from("product_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "completed")
    .single()

  if (existingPurchase) {
    redirect(`/product/${slug}`)
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">
          {product.price === 0 ? "무료 다운로드" : "결제하기"}
        </h1>
        <ProductPurchaseForm product={product} user={user} profile={profile} />
      </div>
    </div>
  )
}
