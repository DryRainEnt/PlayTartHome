import { FeedbackForm } from "@/components/feedback-form"
import { createClient } from "@/lib/supabase/server"

export default async function FeedbackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">피드백</h1>
          <p className="text-muted-foreground">문의사항이나 의견을 보내주세요</p>
        </div>

        <FeedbackForm userId={user?.id} userEmail={user?.email} />
      </div>
    </div>
  )
}
