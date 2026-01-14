-- Fix courses RLS policies for admin access

-- 관리자가 모든 강의 조회 가능 (비공개 포함)
create policy "courses_select_admin"
  on public.courses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 관리자가 강의 추가 가능
create policy "courses_insert_admin"
  on public.courses for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 관리자가 강의 수정 가능
create policy "courses_update_admin"
  on public.courses for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 관리자가 강의 삭제 가능
create policy "courses_delete_admin"
  on public.courses for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- course_sections 관리자 정책
create policy "course_sections_insert_admin"
  on public.course_sections for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_sections_update_admin"
  on public.course_sections for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_sections_delete_admin"
  on public.course_sections for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- course_lessons 관리자 정책
create policy "course_lessons_insert_admin"
  on public.course_lessons for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_lessons_update_admin"
  on public.course_lessons for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_lessons_delete_admin"
  on public.course_lessons for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- course_categories 관리자 정책
create policy "course_categories_insert_admin"
  on public.course_categories for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_categories_update_admin"
  on public.course_categories for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "course_categories_delete_admin"
  on public.course_categories for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
