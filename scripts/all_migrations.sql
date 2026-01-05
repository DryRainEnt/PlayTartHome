-- Create profiles table for user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
-- Course categories
create table if not exists public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.course_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  instructor_id uuid references public.profiles(id) on delete set null,
  instructor_name text not null,
  price decimal(10, 2) not null default 0,
  original_price decimal(10, 2),
  duration_minutes int,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  is_published boolean default false,
  total_lessons int default 0,
  total_students int default 0,
  rating decimal(3, 2) default 0,
  review_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Course sections
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null,
  created_at timestamptz default now()
);

-- Course lessons
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.course_sections(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  video_duration int,
  order_index int not null,
  is_free boolean default false,
  created_at timestamptz default now()
);

-- RLS policies for courses (public read, admin write)
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.course_lessons enable row level security;

-- Anyone can view published courses
create policy "courses_select_published"
  on public.courses for select
  using (is_published = true);

create policy "course_categories_select_all"
  on public.course_categories for select
  using (true);

create policy "course_sections_select_all"
  on public.course_sections for select
  using (true);

create policy "course_lessons_select_all"
  on public.course_lessons for select
  using (true);
-- User course purchases
create table if not exists public.course_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  amount_paid decimal(10, 2) not null,
  payment_method text,
  payment_id text,
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  purchased_at timestamptz default now(),
  unique(user_id, course_id)
);

-- User lesson progress
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  is_completed boolean default false,
  watch_time int default 0,
  last_watched_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Course reviews
create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- RLS policies
alter table public.course_purchases enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_reviews enable row level security;

-- Users can view their own purchases
create policy "purchases_select_own"
  on public.course_purchases for select
  using (auth.uid() = user_id);

create policy "purchases_insert_own"
  on public.course_purchases for insert
  with check (auth.uid() = user_id);

-- Users can manage their own progress
create policy "progress_select_own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- Users can view all reviews but only manage their own
create policy "reviews_select_all"
  on public.course_reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.course_reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on public.course_reviews for update
  using (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.course_reviews for delete
  using (auth.uid() = user_id);
-- Outsourcing service categories
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Outsourcing services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.service_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  price_min decimal(10, 2),
  price_max decimal(10, 2),
  delivery_days int,
  is_published boolean default false,
  total_orders int default 0,
  rating decimal(3, 2) default 0,
  review_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Service requests
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  budget decimal(10, 2),
  status text check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_requests enable row level security;

create policy "service_categories_select_all"
  on public.service_categories for select
  using (true);

create policy "services_select_published"
  on public.services for select
  using (is_published = true);

create policy "services_select_own"
  on public.services for select
  using (auth.uid() = provider_id);

create policy "services_insert_own"
  on public.services for insert
  with check (auth.uid() = provider_id);

create policy "services_update_own"
  on public.services for update
  using (auth.uid() = provider_id);

-- Users can see requests they created or received
create policy "requests_select_own"
  on public.service_requests for select
  using (auth.uid() = client_id or auth.uid() = provider_id);

create policy "requests_insert_own"
  on public.service_requests for insert
  with check (auth.uid() = client_id);

create policy "requests_update_provider"
  on public.service_requests for update
  using (auth.uid() = provider_id);
-- Forum categories
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Forum posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete set null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  view_count int default 0,
  reply_count int default 0,
  like_count int default 0,
  is_pinned boolean default false,
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Forum replies
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  like_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Forum post likes
create table if not exists public.forum_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Forum reply likes
create table if not exists public.forum_reply_likes (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.forum_replies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(reply_id, user_id)
);

-- RLS policies
alter table public.forum_categories enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_post_likes enable row level security;
alter table public.forum_reply_likes enable row level security;

create policy "forum_categories_select_all"
  on public.forum_categories for select
  using (true);

-- Authenticated users can view, create, and manage posts
create policy "posts_select_all"
  on public.forum_posts for select
  using (true);

create policy "posts_insert_auth"
  on public.forum_posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update_own"
  on public.forum_posts for update
  using (auth.uid() = author_id);

create policy "posts_delete_own"
  on public.forum_posts for delete
  using (auth.uid() = author_id);

-- Replies
create policy "replies_select_all"
  on public.forum_replies for select
  using (true);

create policy "replies_insert_auth"
  on public.forum_replies for insert
  with check (auth.uid() = author_id);

create policy "replies_update_own"
  on public.forum_replies for update
  using (auth.uid() = author_id);

create policy "replies_delete_own"
  on public.forum_replies for delete
  using (auth.uid() = author_id);

-- Likes
create policy "post_likes_select_all"
  on public.forum_post_likes for select
  using (true);

create policy "post_likes_insert_own"
  on public.forum_post_likes for insert
  with check (auth.uid() = user_id);

create policy "post_likes_delete_own"
  on public.forum_post_likes for delete
  using (auth.uid() = user_id);

create policy "reply_likes_select_all"
  on public.forum_reply_likes for select
  using (true);

create policy "reply_likes_insert_own"
  on public.forum_reply_likes for insert
  with check (auth.uid() = user_id);

create policy "reply_likes_delete_own"
  on public.forum_reply_likes for delete
  using (auth.uid() = user_id);
-- Feedback/inquiries table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  type text check (type in ('inquiry', 'bug', 'suggestion', 'complaint', 'other')) not null,
  subject text not null,
  message text not null,
  email text,
  status text check (status in ('pending', 'in_progress', 'resolved', 'closed')) default 'pending',
  admin_response text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;

create policy "feedback_select_own"
  on public.feedback for select
  using (auth.uid() = user_id or user_id is null);

create policy "feedback_insert_all"
  on public.feedback for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);
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
