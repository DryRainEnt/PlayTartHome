-- =============================================
-- view_count 컬럼 추가
-- courses, services, products 테이블
-- =============================================

-- courses 테이블에 view_count 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- services 테이블에 view_count 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- products 테이블에 view_count 추가
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 인덱스 추가 (정렬용)
CREATE INDEX IF NOT EXISTS idx_courses_view_count ON courses(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_services_view_count ON services(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products(view_count DESC);
