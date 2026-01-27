-- 레슨 첨부파일 필드 추가

BEGIN;

-- attachments 컬럼 추가 (JSONB 배열: [{name, url, size}])
ALTER TABLE public.course_lessons
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

COMMIT;

-- attachments 버킷 생성 (비공개 - 구매자만 접근)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,  -- 비공개 버킷
  52428800, -- 50MB
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책

-- 강의 구매자만 첨부파일 다운로드 가능
DROP POLICY IF EXISTS "Purchasers can download attachments" ON storage.objects;
CREATE POLICY "Purchasers can download attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.course_purchases cp
        WHERE cp.user_id = auth.uid()
        AND cp.status = 'completed'
        AND cp.course_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- 관리자만 업로드 가능
DROP POLICY IF EXISTS "Admin can upload attachments" ON storage.objects;
CREATE POLICY "Admin can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments'
    AND public.is_admin()
  );

-- 관리자만 삭제 가능
DROP POLICY IF EXISTS "Admin can delete attachments" ON storage.objects;
CREATE POLICY "Admin can delete attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments'
    AND public.is_admin()
  );

SELECT 'Lesson attachments field and storage bucket created successfully' as status;
