-- 기존 강의 카테고리 삭제 (연결된 강의가 없는 경우에만)
-- DELETE FROM course_categories;

-- 강의 카테고리 추가/업데이트
INSERT INTO course_categories (name, slug, description) VALUES
  ('픽셀아트', 'pixel-art', '픽셀아트 기초부터 캐릭터 제작까지'),
  ('애니메이션', 'animation', '스프라이트 애니메이션 제작'),
  ('배경', 'background', '게임 배경 및 타일셋 제작'),
  ('AI창작', 'ai-creation', 'AI를 활용한 창작 방법'),
  ('생존', 'survival', '창작자 생존 전략, 수익화, 마케팅')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 외주 서비스 카테고리 추가/업데이트
INSERT INTO service_categories (name, slug, description) VALUES
  ('캐릭터', 'character', '게임 캐릭터 스프라이트 제작'),
  ('애니메이션', 'animation', '캐릭터/이펙트 애니메이션'),
  ('타일셋', 'tileset', '맵 타일 및 배경 제작'),
  ('UI/아이콘', 'ui', '게임 UI 및 아이콘 디자인'),
  ('일러스트/초상화', 'portrait', '캐릭터 초상화 및 일러스트'),
  ('풀 프로젝트', 'full-project', '전체 게임 리소스 패키지')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 결과 확인
SELECT 'course_categories' as table_name, name, slug FROM course_categories
UNION ALL
SELECT 'service_categories', name, slug FROM service_categories;
