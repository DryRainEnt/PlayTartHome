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
