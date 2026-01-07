-- =============================================
-- 카테고리 업데이트
-- 강의: 인디게임개발 추가
-- 외주: 일러스트/초상화, 풀 프로젝트 삭제
-- =============================================

-- 1. 강의 카테고리에 '인디게임개발' 추가
INSERT INTO course_categories (name, slug, description) VALUES
  ('인디게임개발', 'indie-game-dev', '게임 기획부터 출시까지, 1인 개발자를 위한 가이드')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. 외주 카테고리에서 삭제 (연결된 서비스가 없는 경우에만)
-- 주의: 이미 연결된 서비스가 있으면 에러 발생할 수 있음
DELETE FROM service_categories WHERE slug = 'portrait';
DELETE FROM service_categories WHERE slug = 'full-project';

-- 결과 확인
SELECT 'course_categories' as table_name, name, slug FROM course_categories
UNION ALL
SELECT 'service_categories', name, slug FROM service_categories
ORDER BY table_name, slug;
