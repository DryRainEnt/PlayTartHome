-- 이미지 업로드용 Storage 버킷 생성
-- Supabase Dashboard > Storage 에서 직접 생성해도 됩니다.

-- thumbnails 버킷 생성 (공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책

-- 누구나 공개 이미지 조회 가능
DROP POLICY IF EXISTS "Public thumbnails access" ON storage.objects;
CREATE POLICY "Public thumbnails access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- 관리자만 업로드 가능
DROP POLICY IF EXISTS "Admin can upload thumbnails" ON storage.objects;
CREATE POLICY "Admin can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND public.is_admin()
  );

-- 관리자만 삭제 가능
DROP POLICY IF EXISTS "Admin can delete thumbnails" ON storage.objects;
CREATE POLICY "Admin can delete thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails'
    AND public.is_admin()
  );

SELECT 'Storage bucket and policies created successfully' as status;
