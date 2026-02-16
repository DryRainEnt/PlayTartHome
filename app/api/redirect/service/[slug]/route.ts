import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch service
  const { data: service, error } = await supabase
    .from("services")
    .select("id, external_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!service || !service.external_url) {
    // No external URL - redirect to detail page
    return NextResponse.redirect(new URL(`/outsourcing/${slug}`, request.url))
  }

  // Track activity
  await supabase.from("activity_logs").insert({
    action_type: "page_view",
    resource_type: "service",
    resource_id: service.id,
    resource_slug: slug,
    metadata: { redirected_to: service.external_url },
  })

  // Increment view count
  await supabase.rpc("increment_view_count", {
    table_name: "services",
    row_id: service.id,
  })

  // Validate external URL protocol
  try {
    const parsed = new URL(service.external_url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.redirect(new URL(`/outsourcing/${slug}`, request.url))
    }
  } catch {
    return NextResponse.redirect(new URL(`/outsourcing/${slug}`, request.url))
  }

  // Redirect to external URL
  return NextResponse.redirect(service.external_url)
}
