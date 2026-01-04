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
