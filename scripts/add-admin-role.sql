-- profiles 테이블에 role 컬럼 추가 (없으면)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 특정 사용자를 관리자로 설정 (이메일 주소를 본인 것으로 변경)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- 또는 user_id로 설정
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';

-- RLS 정책: 관리자는 모든 데이터 접근 가능
CREATE POLICY "Admins can do everything" ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do everything" ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
