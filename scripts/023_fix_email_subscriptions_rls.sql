-- =============================================
-- 이메일 구독 테이블 RLS 정책 수정
-- 관리자가 모든 구독자를 조회할 수 있도록 추가
-- =============================================

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON email_subscriptions;

-- 관리자는 모든 구독 조회 가능
CREATE POLICY "Admins can view all subscriptions" ON email_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 확인
SELECT 'email_subscriptions RLS policy updated for admins' as status;
