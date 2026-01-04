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
