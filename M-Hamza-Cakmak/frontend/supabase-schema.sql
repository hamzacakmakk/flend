-- Flend - Rakip Takibi Modülü Veritabanı Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- Ürünler tablosu (demo verisi için)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  current_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rakipler tablosu
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  competitor_url TEXT NOT NULL,
  seller_name TEXT NOT NULL DEFAULT 'Bilinmeyen Satıcı',
  last_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fiyat geçmişi tablosu
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Indeksler
CREATE INDEX idx_competitors_product_id ON competitors(product_id);
CREATE INDEX idx_price_history_competitor_id ON price_history(competitor_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);

-- RLS (Row Level Security) - Supabase için
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Geliştirme aşamasında herkese okuma/yazma izni
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on competitors" ON competitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on price_history" ON price_history FOR ALL USING (true) WITH CHECK (true);

-- Demo ürünler
INSERT INTO products (id, name, current_price, image_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Samsung Galaxy S24 Ultra', 64999.00, null),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Apple iPhone 15 Pro Max', 74999.00, null),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Sony WH-1000XM5 Kulaklık', 12499.00, null);

-- Demo rakipler
INSERT INTO competitors (id, product_id, competitor_url, seller_name, last_price, is_active) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.trendyol.com/samsung-galaxy-s24', 'TeknoFırsat', 63499.00, true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.hepsiburada.com/samsung-galaxy-s24', 'HepsiBurada Mağaza', 65200.00, true),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'https://www.trendyol.com/iphone-15-pro', 'AppleStore TR', 73999.00, true),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'https://www.amazon.com.tr/sony-wh1000xm5', 'SesDünyası', 11899.00, false);

-- Demo fiyat geçmişi
INSERT INTO price_history (competitor_id, price, recorded_at) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 65999.00, now() - interval '7 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 64999.00, now() - interval '5 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 64499.00, now() - interval '3 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 63999.00, now() - interval '1 day'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 63499.00, now()),
  ('b1b2c3d4-0002-4000-8000-000000000002', 66500.00, now() - interval '7 days'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 66000.00, now() - interval '4 days'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 65500.00, now() - interval '2 days'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 65200.00, now()),
  ('b1b2c3d4-0003-4000-8000-000000000003', 76999.00, now() - interval '6 days'),
  ('b1b2c3d4-0003-4000-8000-000000000003', 75499.00, now() - interval '3 days'),
  ('b1b2c3d4-0003-4000-8000-000000000003', 73999.00, now());
