-- Seed course categories (플레이타르트 실제 강의 분야)
insert into public.course_categories (name, slug, description) values
  ('픽셀아트', 'pixel-art', '픽셀아트 및 도트 게임 리소스 제작'),
  ('AI 웹사이트 제작', 'ai-website', 'AI 활용 웹사이트 및 랜딩페이지 제작'),
  ('창작자 생존기', 'creator-survival', '인디 창작자를 위한 멘탈 관리 및 생존 전략')
on conflict (slug) do nothing;

-- Seed service categories (외주 서비스 분야)
insert into public.service_categories (name, slug, description) values
  ('픽셀아트 리소스', 'pixel-art-resource', '게임용 픽셀아트 캐릭터, 타일셋, 애니메이션'),
  ('도트 UI/UX', 'pixel-ui', '게임 UI, 아이콘, 인터페이스 디자인'),
  ('랜딩페이지 제작', 'landing-page', '개인 브랜딩용 웹사이트 및 랜딩페이지')
on conflict (slug) do nothing;

-- Seed forum categories (커뮤니티 게시판)
insert into public.forum_categories (name, slug, description, order_index) values
  ('공지사항', 'announcements', '플레이타르트 공지 및 운영 소통', 0),
  ('실습 공유', 'practice', '강의 실습 결과물 공유', 1),
  ('리뷰', 'reviews', '강의 및 서비스 리뷰', 2),
  ('자유게시판', 'free-board', '자유로운 주제의 게시판', 3),
  ('질문과 답변', 'qna', '강의 및 서비스 관련 질문', 4)
on conflict (slug) do nothing;
