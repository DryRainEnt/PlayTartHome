import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreatePostForm } from "@/components/create-post-form"

export default async function NewPostPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch categories
  const { data: categories } = await supabase.from("forum_categories").select("*").order("order_index")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">새 글 작성</h1>
        <CreatePostForm categories={categories || []} userId={user.id} />
      </div>
    </div>
  )
}
