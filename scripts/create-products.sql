-- 제품 카테고리 테이블
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 제품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT, -- 상세 설명 (마크다운)
  price INTEGER NOT NULL DEFAULT 0, -- 원 단위
  original_price INTEGER, -- 할인 전 가격
  thumbnail_url TEXT,
  preview_images TEXT[], -- 미리보기 이미지 배열
  download_url TEXT, -- 구매 후 다운로드 URL
  file_size TEXT, -- ex: "25MB"
  file_format TEXT, -- ex: "PNG, PSD"

  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 제품 구매 테이블
CREATE TABLE IF NOT EXISTS product_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  amount_paid INTEGER NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  order_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, product_id, status)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_product_purchases_user ON product_purchases(user_id);

-- RLS 정책
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

-- 카테고리 조회 (모두 가능)
CREATE POLICY "Anyone can view product categories" ON product_categories
  FOR SELECT USING (true);

-- 제품 조회 (공개된 것만)
CREATE POLICY "Anyone can view published products" ON products
  FOR SELECT USING (is_published = true OR seller_id = auth.uid());

-- 제품 등록/수정 (판매자만)
CREATE POLICY "Sellers can manage own products" ON products
  FOR ALL USING (seller_id = auth.uid());

-- 구매 내역 조회 (본인만)
CREATE POLICY "Users can view own purchases" ON product_purchases
  FOR SELECT USING (user_id = auth.uid());

-- 구매 생성
CREATE POLICY "Users can create purchases" ON product_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 기본 카테고리 추가
INSERT INTO product_categories (name, slug, description, order_index) VALUES
  ('스프라이트', 'sprite', '게임용 캐릭터/오브젝트 스프라이트', 1),
  ('타일셋', 'tileset', '맵 제작용 타일셋', 2),
  ('UI 팩', 'ui-pack', '게임 UI 에셋 팩', 3),
  ('이펙트', 'effect', '이펙트/파티클 에셋', 4),
  ('배경', 'background', '배경 이미지/일러스트', 5),
  ('템플릿', 'template', '프로젝트 템플릿', 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 결과 확인
SELECT 'products tables created' as status;
SELECT * FROM product_categories ORDER BY order_index;
