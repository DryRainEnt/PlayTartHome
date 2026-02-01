-- Lesson comments (with parent_id for replies)
create table if not exists public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.lesson_comments(id) on delete cascade,
  content text not null,
  like_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lesson comment likes
create table if not exists public.lesson_comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.lesson_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- Indexes for performance
create index if not exists idx_lesson_comments_lesson_id on public.lesson_comments(lesson_id);
create index if not exists idx_lesson_comments_parent_id on public.lesson_comments(parent_id);
create index if not exists idx_lesson_comment_likes_comment_id on public.lesson_comment_likes(comment_id);

-- RLS policies
alter table public.lesson_comments enable row level security;
alter table public.lesson_comment_likes enable row level security;

-- Comments: anyone can read, authenticated users can create, only author can update/delete
create policy "lesson_comments_select_all"
  on public.lesson_comments for select
  using (true);

create policy "lesson_comments_insert_auth"
  on public.lesson_comments for insert
  with check (auth.uid() = user_id);

create policy "lesson_comments_update_own"
  on public.lesson_comments for update
  using (auth.uid() = user_id);

create policy "lesson_comments_delete_own"
  on public.lesson_comments for delete
  using (auth.uid() = user_id);

-- Likes: anyone can read, authenticated users can create/delete their own
create policy "lesson_comment_likes_select_all"
  on public.lesson_comment_likes for select
  using (true);

create policy "lesson_comment_likes_insert_own"
  on public.lesson_comment_likes for insert
  with check (auth.uid() = user_id);

create policy "lesson_comment_likes_delete_own"
  on public.lesson_comment_likes for delete
  using (auth.uid() = user_id);

-- Function to update like_count on lesson_comments
create or replace function update_lesson_comment_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.lesson_comments
    set like_count = like_count + 1
    where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.lesson_comments
    set like_count = like_count - 1
    where id = OLD.comment_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for like count
drop trigger if exists lesson_comment_likes_count_trigger on public.lesson_comment_likes;
create trigger lesson_comment_likes_count_trigger
after insert or delete on public.lesson_comment_likes
for each row execute function update_lesson_comment_like_count();
