-- Add admin read policy for lesson_progress
-- Allows admins to view all student progress

DROP POLICY IF EXISTS "progress_select_admin" ON public.lesson_progress;

CREATE POLICY "progress_select_admin"
  ON public.lesson_progress FOR SELECT
  USING (public.is_admin());
