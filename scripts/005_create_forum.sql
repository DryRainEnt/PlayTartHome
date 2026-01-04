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
