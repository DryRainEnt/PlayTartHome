-- =============================================
-- RPC 함수들
-- 조회수 증가, 통계 집계 등
-- =============================================

-- 원자적 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(p_table_name TEXT, p_row_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE p_table_name
    WHEN 'courses' THEN
      UPDATE courses SET view_count = view_count + 1 WHERE id = p_row_id;
    WHEN 'services' THEN
      UPDATE services SET view_count = view_count + 1 WHERE id = p_row_id;
    WHEN 'products' THEN
      UPDATE products SET view_count = view_count + 1 WHERE id = p_row_id;
    WHEN 'forum_posts' THEN
      UPDATE forum_posts SET view_count = view_count + 1 WHERE id = p_row_id;
    ELSE
      RAISE EXCEPTION 'Unknown table: %', p_table_name;
  END CASE;
END;
$$;

-- 일별 통계 조회 함수
CREATE OR REPLACE FUNCTION get_daily_stats(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  stat_date DATE,
  total_views BIGINT,
  unique_visitors BIGINT,
  new_signups BIGINT,
  total_purchases BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS d
  ),
  views AS (
    SELECT
      DATE(created_at) AS d,
      COUNT(*) AS cnt,
      COUNT(DISTINCT COALESCE(user_id::text, session_id)) AS uniq
    FROM activity_logs
    WHERE action_type = 'page_view'
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(created_at)
  ),
  signups AS (
    SELECT
      DATE(created_at) AS d,
      COUNT(*) AS cnt
    FROM profiles
    WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(created_at)
  ),
  purchases AS (
    SELECT
      DATE(created_at) AS d,
      COUNT(*) AS cnt
    FROM activity_logs
    WHERE action_type = 'purchase'
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(created_at)
  )
  SELECT
    dates.d AS stat_date,
    COALESCE(views.cnt, 0) AS total_views,
    COALESCE(views.uniq, 0) AS unique_visitors,
    COALESCE(signups.cnt, 0) AS new_signups,
    COALESCE(purchases.cnt, 0) AS total_purchases
  FROM dates
  LEFT JOIN views ON dates.d = views.d
  LEFT JOIN signups ON dates.d = signups.d
  LEFT JOIN purchases ON dates.d = purchases.d
  ORDER BY dates.d;
END;
$$;

-- 조회수 TOP N 조회 함수
CREATE OR REPLACE FUNCTION get_top_viewed(p_resource_type TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  view_count INTEGER,
  resource_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_resource_type = 'course' OR p_resource_type = 'all' THEN
    RETURN QUERY
    SELECT c.id, c.title, c.slug, c.view_count, 'course'::TEXT
    FROM courses c
    WHERE c.is_published = true
    ORDER BY c.view_count DESC
    LIMIT p_limit;
  END IF;

  IF p_resource_type = 'service' OR p_resource_type = 'all' THEN
    RETURN QUERY
    SELECT s.id, s.title, s.slug, s.view_count, 'service'::TEXT
    FROM services s
    WHERE s.is_published = true
    ORDER BY s.view_count DESC
    LIMIT p_limit;
  END IF;

  IF p_resource_type = 'product' OR p_resource_type = 'all' THEN
    RETURN QUERY
    SELECT p.id, p.title, p.slug, p.view_count, 'product'::TEXT
    FROM products p
    WHERE p.is_published = true
    ORDER BY p.view_count DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- 사용자 활동 통계 함수
CREATE OR REPLACE FUNCTION get_user_analytics(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  active_users BIGINT,
  new_users BIGINT,
  returning_users BIGINT,
  total_page_views BIGINT,
  avg_session_duration NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMPTZ := NOW() - (p_days || ' days')::interval;
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE user_id IS NOT NULL AND created_at >= v_start_date) AS active_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= v_start_date) AS new_users,
    (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE user_id IS NOT NULL AND created_at >= v_start_date AND user_id IN (SELECT user_id FROM activity_logs WHERE created_at < v_start_date)) AS returning_users,
    (SELECT COUNT(*) FROM activity_logs WHERE action_type = 'page_view' AND created_at >= v_start_date) AS total_page_views,
    (SELECT COALESCE(AVG(duration_seconds), 0) FROM activity_logs WHERE action_type = 'duration' AND created_at >= v_start_date) AS avg_session_duration;
END;
$$;
