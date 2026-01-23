-- 관리자 RLS 정책 추가
-- is_admin() 함수가 이미 존재한다고 가정 (028 스크립트에서 생성됨)
-- 트랜잭션으로 감싸서 실패 시 자동 롤백

BEGIN;

-- =====================
-- COURSES 테이블
-- =====================

-- 관리자는 모든 강의 조회 가능 (비공개 포함)
DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all"
  ON public.courses FOR SELECT
  USING (is_published = true OR public.is_admin());

-- 관리자만 강의 생성
DROP POLICY IF EXISTS "courses_insert_admin" ON public.courses;
CREATE POLICY "courses_insert_admin"
  ON public.courses FOR INSERT
  WITH CHECK (public.is_admin());

-- 관리자만 강의 수정
DROP POLICY IF EXISTS "courses_update_admin" ON public.courses;
CREATE POLICY "courses_update_admin"
  ON public.courses FOR UPDATE
  USING (public.is_admin());

-- 관리자만 강의 삭제
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;
CREATE POLICY "courses_delete_admin"
  ON public.courses FOR DELETE
  USING (public.is_admin());

-- =====================
-- COURSE_SECTIONS 테이블
-- =====================

DROP POLICY IF EXISTS "course_sections_select_all" ON public.course_sections;
CREATE POLICY "course_sections_select_all"
  ON public.course_sections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "course_sections_insert_admin" ON public.course_sections;
CREATE POLICY "course_sections_insert_admin"
  ON public.course_sections FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "course_sections_update_admin" ON public.course_sections;
CREATE POLICY "course_sections_update_admin"
  ON public.course_sections FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "course_sections_delete_admin" ON public.course_sections;
CREATE POLICY "course_sections_delete_admin"
  ON public.course_sections FOR DELETE
  USING (public.is_admin());

-- =====================
-- COURSE_LESSONS 테이블
-- =====================

DROP POLICY IF EXISTS "course_lessons_select_all" ON public.course_lessons;
CREATE POLICY "course_lessons_select_all"
  ON public.course_lessons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "course_lessons_insert_admin" ON public.course_lessons;
CREATE POLICY "course_lessons_insert_admin"
  ON public.course_lessons FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "course_lessons_update_admin" ON public.course_lessons;
CREATE POLICY "course_lessons_update_admin"
  ON public.course_lessons FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "course_lessons_delete_admin" ON public.course_lessons;
CREATE POLICY "course_lessons_delete_admin"
  ON public.course_lessons FOR DELETE
  USING (public.is_admin());

-- =====================
-- SERVICES 테이블
-- =====================

DROP POLICY IF EXISTS "services_insert_admin" ON public.services;
CREATE POLICY "services_insert_admin"
  ON public.services FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "services_update_admin" ON public.services;
CREATE POLICY "services_update_admin"
  ON public.services FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "services_delete_admin" ON public.services;
CREATE POLICY "services_delete_admin"
  ON public.services FOR DELETE
  USING (public.is_admin());

-- =====================
-- PRODUCTS 테이블
-- =====================

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
DROP POLICY IF EXISTS "products_select_all" ON public.products;

CREATE POLICY "products_select_all"
  ON public.products FOR SELECT
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- =====================
-- COURSE_PURCHASES 테이블 (관리자 조회 추가)
-- =====================

DROP POLICY IF EXISTS "purchases_select_own" ON public.course_purchases;
DROP POLICY IF EXISTS "purchases_select_own_or_admin" ON public.course_purchases;
CREATE POLICY "purchases_select_own_or_admin"
  ON public.course_purchases FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- =====================
-- PRODUCT_PURCHASES 테이블 (관리자 조회 추가)
-- =====================

DROP POLICY IF EXISTS "Users can view own purchases" ON public.product_purchases;
DROP POLICY IF EXISTS "product_purchases_select_own_or_admin" ON public.product_purchases;
CREATE POLICY "product_purchases_select_own_or_admin"
  ON public.product_purchases FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

COMMIT;

-- 완료 확인
SELECT 'Admin RLS policies added successfully' as status;
