-- 기존 select 정책 삭제
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 새 정책: 본인 프로필 또는 관리자는 모든 프로필 조회 가능
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 참고: role 컬럼이 없다면 먼저 추가 필요
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
