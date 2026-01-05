-- 이메일 구독 테이블 생성
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('new_course', 'new_service', 'newsletter')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  -- 같은 이메일로 같은 유형 중복 구독 방지
  UNIQUE (email, subscription_type)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_type ON email_subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active);

-- RLS 정책
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- 누구나 구독 가능 (INSERT)
CREATE POLICY "Anyone can subscribe" ON email_subscriptions
  FOR INSERT WITH CHECK (true);

-- 본인 구독만 조회 가능
CREATE POLICY "Users can view own subscriptions" ON email_subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 본인 구독만 수정 가능 (구독 취소 등)
CREATE POLICY "Users can update own subscriptions" ON email_subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 구독자 수 조회용 함수 (익명 접근 허용)
CREATE OR REPLACE FUNCTION get_subscription_count(sub_type TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM email_subscriptions
  WHERE subscription_type = sub_type AND is_active = true;
$$;

-- 확인
SELECT 'email_subscriptions table created' as status;
