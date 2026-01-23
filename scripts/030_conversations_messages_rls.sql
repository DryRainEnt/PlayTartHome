-- conversations 및 messages 테이블 생성 + RLS 정책
-- 트랜잭션으로 감싸서 실패 시 자동 롤백

BEGIN;

-- =====================
-- 테이블 생성
-- =====================

-- conversations 테이블
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text CHECK (status IN ('open', 'closed', 'accepted')) DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- messages 테이블
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider_id ON public.conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- =====================
-- RLS 활성화
-- =====================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =====================
-- CONVERSATIONS 정책
-- =====================

DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
CREATE POLICY "conversations_select_own"
  ON public.conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

DROP POLICY IF EXISTS "conversations_insert_client" ON public.conversations;
CREATE POLICY "conversations_insert_client"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "conversations_update_participants" ON public.conversations;
CREATE POLICY "conversations_update_participants"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- =====================
-- MESSAGES 정책
-- =====================

DROP POLICY IF EXISTS "messages_select_conversation_participant" ON public.messages;
CREATE POLICY "messages_select_conversation_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.client_id OR auth.uid() = c.provider_id)
    )
  );

DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.client_id OR auth.uid() = c.provider_id)
    )
  );

DROP POLICY IF EXISTS "messages_update_read_status" ON public.messages;
CREATE POLICY "messages_update_read_status"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() != sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.client_id OR auth.uid() = c.provider_id)
    )
  );

-- =====================
-- 관리자 정책
-- =====================

DROP POLICY IF EXISTS "conversations_select_admin" ON public.conversations;
CREATE POLICY "conversations_select_admin"
  ON public.conversations FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "messages_select_admin" ON public.messages;
CREATE POLICY "messages_select_admin"
  ON public.messages FOR SELECT
  USING (public.is_admin());

COMMIT;

-- 완료 확인
SELECT 'Conversations and Messages tables + RLS policies created successfully' as status;
