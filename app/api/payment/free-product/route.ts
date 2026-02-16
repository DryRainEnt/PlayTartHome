import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { productId, orderId } = await request.json()

  if (!productId || !orderId) {
    return NextResponse.json({ error: "productId and orderId are required" }, { status: 400 })
  }

  // Verify the product exists and is actually free
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, is_published")
    .eq("id", productId)
    .eq("is_published", true)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  if (product.price !== 0) {
    return NextResponse.json({ error: "This product is not free" }, { status: 400 })
  }

  // Check for existing purchase
  const { data: existingPurchase } = await supabase
    .from("product_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("status", "completed")
    .single()

  if (existingPurchase) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 })
  }

  // Create the purchase record
  const { data: purchase, error: insertError } = await supabase
    .from("product_purchases")
    .insert({
      user_id: user.id,
      product_id: productId,
      amount_paid: 0,
      payment_method: "무료",
      status: "completed",
      order_id: orderId,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Free product purchase error:", insertError)
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true, purchase })
}
