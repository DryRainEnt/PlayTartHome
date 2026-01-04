-- Seed course categories
insert into public.course_categories (name, slug, description) values
  ('디자인', 'design', '그래픽 디자인, UI/UX, 일러스트레이션'),
  ('영상 편집', 'video-editing', '프리미어 프로, 애프터 이펙트, 파이널 컷'),
  ('3D 모델링', '3d-modeling', '블렌더, Cinema 4D, Maya'),
  ('포토샵', 'photoshop', '사진 보정 및 합성'),
  ('마케팅', 'marketing', '디지털 마케팅, SNS 마케팅')
on conflict (slug) do nothing;

-- Seed service categories
insert into public.service_categories (name, slug, description) values
  ('로고 디자인', 'logo-design', '브랜드 로고 제작'),
  ('영상 제작', 'video-production', '홍보 영상, 유튜브 영상'),
  ('썸네일 제작', 'thumbnail-design', 'YouTube 썸네일'),
  ('웹 디자인', 'web-design', '웹사이트 UI/UX 디자인'),
  ('일러스트', 'illustration', '캐릭터, 배경 일러스트')
on conflict (slug) do nothing;

-- Seed forum categories
insert into public.forum_categories (name, slug, description, order_index) values
  ('공지사항', 'announcements', 'Playtart 공지사항', 0),
  ('자유게시판', 'free-board', '자유로운 주제의 게시판', 1),
  ('질문과 답변', 'qna', '강의 및 서비스 관련 질문', 2),
  ('포트폴리오', 'portfolio', '작품 공유 게시판', 3),
  ('구인구직', 'jobs', '프리랜서 구인구직', 4)
on conflict (slug) do nothing;
