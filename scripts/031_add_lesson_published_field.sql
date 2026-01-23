-- 레슨에 공개 여부 필드 추가 (추후 공개 예정 기능)

BEGIN;

-- is_published 컬럼 추가 (기본값 true = 기존 레슨은 모두 공개 상태)
ALTER TABLE public.course_lessons
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- scheduled_at 컬럼 추가 (예약 공개 일시, 선택사항)
ALTER TABLE public.course_lessons
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT NULL;

COMMIT;

SELECT 'Lesson published fields added successfully' as status;
