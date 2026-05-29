-- 무료 강의 첨부파일은 로그인한 사용자 누구나 다운로드 가능하도록 정책 확장
-- (유료 강의 첨부는 기존대로 구매 완료자/관리자만 가능)

DROP POLICY IF EXISTS "Purchasers can download attachments" ON storage.objects;

CREATE POLICY "Purchasers can download attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments'
    AND (
      -- 관리자
      public.is_admin()
      -- 구매 완료자 (해당 강의)
      OR EXISTS (
        SELECT 1 FROM public.course_purchases cp
        WHERE cp.user_id = auth.uid()
          AND cp.status = 'completed'
          AND cp.course_id::text = (storage.foldername(name))[1]
      )
      -- 로그인한 사용자: 무료 강의에 첨부된 파일
      OR (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.course_lessons cl
          WHERE cl.is_free = true
            AND cl.attachments @> jsonb_build_array(jsonb_build_object('url', name))
        )
      )
    )
  );

SELECT 'Free lesson attachments are now downloadable by logged-in users' as status;
