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
