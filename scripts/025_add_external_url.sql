-- =============================================
-- 외주 서비스에 외부 링크 기능 추가
-- 크몽 등 외부 플랫폼으로 연결할 때 사용
-- =============================================

-- services 테이블에 external_url 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS external_url text;

-- 컬럼 설명 추가
COMMENT ON COLUMN services.external_url IS '외부 플랫폼 링크 (크몽 등). 설정 시 상세 페이지 대신 외부로 리다이렉트';

-- 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'external_url';
