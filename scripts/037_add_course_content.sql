-- Add content column to courses table for detailed course description (markdown)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS content TEXT;
