-- =============================================
-- course_purchases 테이블에 order_id 컬럼 추가
-- 토스페이먼츠 연동을 위한 주문번호 저장
-- =============================================

-- order_id 컬럼 추가
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS order_id TEXT;

-- 인덱스 추가 (주문번호로 빠른 조회)
CREATE INDEX IF NOT EXISTS idx_course_purchases_order_id ON course_purchases(order_id);

-- 컬럼 설명
COMMENT ON COLUMN course_purchases.order_id IS '토스페이먼츠 주문번호 (PT날짜-랜덤문자)';

-- 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'course_purchases' AND column_name = 'order_id';
