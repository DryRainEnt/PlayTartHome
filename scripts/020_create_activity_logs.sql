-- =============================================
-- Activity Logs 테이블 생성
-- 유저 활동 추적 (조회, 클릭, 구매 등)
-- =============================================

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자 정보 (비로그인 사용자도 추적 가능하도록 nullable)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- 비로그인 사용자 세션 식별

  -- 활동 유형
  action_type TEXT NOT NULL CHECK (action_type IN (
    'page_view',      -- 페이지 조회
    'click',          -- 클릭 (버튼, 링크 등)
    'purchase',       -- 구매
    'signup',         -- 회원가입
    'login',          -- 로그인
    'search',         -- 검색
    'download',       -- 다운로드
    'share',          -- 공유
    'duration'        -- 체류시간 업데이트
  )),

  -- 리소스 정보
  resource_type TEXT CHECK (resource_type IN (
    'course', 'service', 'product', 'forum_post', 'lesson', 'page'
  )),
  resource_id UUID,        -- 해당 리소스의 ID
  resource_slug TEXT,      -- URL용 slug (검색 편의)

  -- 메타데이터
  page_url TEXT,           -- 접속 페이지 URL
  referrer TEXT,           -- 유입 경로
  user_agent TEXT,         -- 브라우저/디바이스 정보

  -- 체류 시간 (page_view일 때 사용)
  duration_seconds INTEGER DEFAULT 0, -- 체류 시간 (초)

  -- 추가 정보 (유연한 확장)
  metadata JSONB DEFAULT '{}', -- 검색어, 클릭 요소 등 추가 정보

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (쿼리 성능)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS 정책
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회 가능
CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 모든 인증 사용자가 활동 로그 생성 가능
CREATE POLICY "Users can insert activity" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- anon 사용자도 로그 생성 가능 (비로그인 추적)
CREATE POLICY "Anon can insert activity" ON activity_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 관리자만 삭제 가능
CREATE POLICY "Admins can delete activity logs" ON activity_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
