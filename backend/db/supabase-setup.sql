-- ==========================================================================
-- Flend — Supabase TEK SEFERLİK kurulum scripti
-- Supabase Dashboard → SQL Editor'e yapıştır → RUN.
--
-- 1) Eski tabloları siler (DROP ... CASCADE)
-- 2) Tüm şemayı yeniden kurar
-- 3) DEĞİŞİKLİK: products.integration_id artık ON DELETE CASCADE
--    → entegrasyon silinince bağlı ürünler de OTOMATİK silinir.
-- 4) Demo kullanıcı + Free paket seed'i (login: demo@flend.com / demo1234)
-- ==========================================================================

-- ── 0. Eski tabloları temizle (bağımlılık sırası önemsiz: CASCADE) ─────────
DROP TABLE IF EXISTS alert_rules           CASCADE;
DROP TABLE IF EXISTS notifications          CASCADE;
DROP TABLE IF EXISTS campaign_suggestions   CASCADE;
DROP TABLE IF EXISTS dashboard_stats        CASCADE;
DROP TABLE IF EXISTS rule_assignments       CASCADE;
DROP TABLE IF EXISTS pricing_rules          CASCADE;
DROP TABLE IF EXISTS price_history          CASCADE;
DROP TABLE IF EXISTS competitors            CASCADE;
DROP TABLE IF EXISTS products               CASCADE;
DROP TABLE IF EXISTS integrations           CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;
DROP TABLE IF EXISTS subscription_packages  CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ── 1. Abonelik Paketleri ─────────────────────────────────────────────────
CREATE TABLE subscription_packages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(120) NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  period      VARCHAR(20)  NOT NULL DEFAULT 'monthly',   -- monthly | yearly | free
  features    JSONB        NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ  DEFAULT now()
);

-- ── 2. Kullanıcılar / Satıcılar ───────────────────────────────────────────
CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    VARCHAR(255) UNIQUE NOT NULL,
  password_hash            TEXT NOT NULL,
  full_name                VARCHAR(255),
  company_name             VARCHAR(255),
  phone                    VARCHAR(30),
  avatar_url               TEXT,
  subscription_package_id  UUID REFERENCES subscription_packages(id) ON DELETE SET NULL,
  status                   VARCHAR(20) DEFAULT 'active',
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Pazaryeri Entegrasyonları ──────────────────────────────────────────
CREATE TABLE integrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  marketplace_name  VARCHAR(120) NOT NULL,
  api_key           TEXT,
  api_secret        TEXT,
  base_url          TEXT,
  status            VARCHAR(20) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Ürünler ────────────────────────────────────────────────────────────
-- integration_id ON DELETE SET NULL → entegrasyon silinince ürün DB'de KALIR
-- (integration_id NULL olur). Envanterden gizleme is_active=false ile yapılır.
CREATE TABLE products (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id          UUID REFERENCES integrations(id) ON DELETE SET NULL,
  name                    VARCHAR(255) NOT NULL,
  marketplace_product_id  VARCHAR(255) UNIQUE,
  barcode                 VARCHAR(120),
  price                   NUMERIC(10,2) DEFAULT 0,
  min_price               NUMERIC(10,2),
  stock_quantity          INTEGER DEFAULT 0,
  currency                VARCHAR(8) DEFAULT 'TRY',
  image_url               TEXT,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Rakipler ───────────────────────────────────────────────────────────
CREATE TABLE competitors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  competitor_url  TEXT NOT NULL,
  seller_name     VARCHAR(255) NOT NULL DEFAULT 'Bilinmeyen Satıcı',
  last_price      NUMERIC(10,2),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 6. Fiyat Geçmişi ──────────────────────────────────────────────────────
CREATE TABLE price_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id  UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  price          NUMERIC(10,2) NOT NULL,
  recorded_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 7. Fiyatlandırma Kuralları ────────────────────────────────────────────
CREATE TABLE pricing_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  rule_name   VARCHAR(255) NOT NULL,
  rule_type   VARCHAR(30) NOT NULL DEFAULT 'COMPETITOR_BASED'
              CHECK (rule_type IN ('COMPETITOR_BASED', 'MARGIN_BASED')),
  value       NUMERIC NOT NULL,
  unit        VARCHAR(8) NOT NULL DEFAULT 'TRY'
              CHECK (unit IN ('TRY', '%')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 8. Kural Atamaları ────────────────────────────────────────────────────
CREATE TABLE rule_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id      UUID REFERENCES pricing_rules(id) ON DELETE CASCADE,
  target_type  VARCHAR(20) NOT NULL DEFAULT 'PRODUCT'
               CHECK (target_type IN ('PRODUCT', 'CATEGORY')),
  target_id    VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 9. Dashboard İstatistikleri ───────────────────────────────────────────
CREATE TABLE dashboard_stats (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buybox_win_rate         DECIMAL(5,2) DEFAULT 0.00,
  tracked_products_count  INTEGER DEFAULT 0,
  total_sales             INTEGER DEFAULT 0,
  active_campaigns        INTEGER DEFAULT 0,
  revenue                 DECIMAL(12,2) DEFAULT 0.00,
  period                  VARCHAR(20) DEFAULT 'daily',
  recorded_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_buybox_rate CHECK (buybox_win_rate >= 0 AND buybox_win_rate <= 100)
);

-- ── 10. Kampanya / Stok Eritme Önerileri ──────────────────────────────────
CREATE TABLE campaign_suggestions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name        VARCHAR(255) NOT NULL,
  product_sku         VARCHAR(100),
  current_stock       INTEGER DEFAULT 0,
  sales_velocity      DECIMAL(8,2) DEFAULT 0.00,
  days_of_stock       INTEGER DEFAULT 0,
  suggested_discount  DECIMAL(5,2) DEFAULT 0.00,
  suggestion_type     VARCHAR(50) NOT NULL DEFAULT 'stok_eritme',
  priority            VARCHAR(20) DEFAULT 'medium',
  status              VARCHAR(20) DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 11. Bildirimler ───────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(50) DEFAULT 'info',
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 12. Alarm / Bildirim Kuralları ────────────────────────────────────────
CREATE TABLE alert_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_name        VARCHAR(255) NOT NULL,
  condition_type   VARCHAR(100) NOT NULL,
  threshold_value  DECIMAL(10,2) NOT NULL,
  threshold_unit   VARCHAR(20) DEFAULT 'percent',
  is_active        BOOLEAN DEFAULT true,
  notify_via       VARCHAR(50) DEFAULT 'in_app',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── İndeksler ──────────────────────────────────────────────────────────────
CREATE INDEX idx_products_user             ON products(user_id);
CREATE INDEX idx_products_integration      ON products(integration_id);
CREATE INDEX idx_integrations_user         ON integrations(user_id);
CREATE INDEX idx_competitors_product_id    ON competitors(product_id);
CREATE INDEX idx_price_history_competitor  ON price_history(competitor_id);
CREATE INDEX idx_price_history_recorded    ON price_history(recorded_at);
CREATE INDEX idx_pricing_rules_user        ON pricing_rules(user_id);
CREATE INDEX idx_rule_assignments_rule     ON rule_assignments(rule_id);
CREATE INDEX idx_dashboard_stats_user      ON dashboard_stats(user_id);
CREATE INDEX idx_campaign_suggestions_user ON campaign_suggestions(user_id);
CREATE INDEX idx_notifications_user        ON notifications(user_id);
CREATE INDEX idx_notifications_is_read     ON notifications(is_read);
CREATE INDEX idx_alert_rules_user          ON alert_rules(user_id);
CREATE INDEX idx_alert_rules_active        ON alert_rules(is_active);

-- ==========================================================================
-- SEED — Tüm tablolar için örnek veri (login: demo@flend.com / demo1234)
-- ==========================================================================

-- ── Abonelik paketleri ─────────────────────────────────────────────────────
INSERT INTO subscription_packages (id, name, price, period, features) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Free',       0.00,   'free',
     '["50 ürün takibi","Manuel fiyat güncelleme"]'),
  ('c0000000-0000-4000-8000-000000000002', 'Pro Aylık',  99.99,  'monthly',
     '["Sınırsız ürün","Otomatik bot","Rakip analizi","Bildirimler"]'),
  ('c0000000-0000-4000-8000-000000000003', 'Pro Yıllık', 999.99, 'yearly',
     '["Pro Aylık tüm özellikleri","2 ay ücretsiz","Öncelikli destek"]')
ON CONFLICT (id) DO NOTHING;

-- ── Demo kullanıcı ─────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, full_name, company_name, phone, subscription_package_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo@flend.com',
  '$2b$10$r0yUZXu5Zf4AjG6wD1riA.0V1suakIZlabLZT45HUaQT/nB7A12ou',  -- bcrypt('demo1234')
  'Ahmet Yılmaz',
  'TechStore TR',
  '+90 555 000 0000',
  'c0000000-0000-4000-8000-000000000002',
  'active'
) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ── Pazaryeri entegrasyonları ──────────────────────────────────────────────
INSERT INTO integrations (id, user_id, marketplace_name, api_key, api_secret, base_url, status) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Trendyol',    'TY-API-KEY-DEMO',  'TY-SECRET-DEMO',  'https://api.trendyol.com/sapigw',     'active'),
  ('e1000000-0000-4000-8000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hepsiburada', 'HB-API-KEY-DEMO',  'HB-SECRET-DEMO',  'https://mpop.hepsiburada.com/api',    'active')
ON CONFLICT (id) DO NOTHING;

-- ── Ürünler (entegrasyona bağlı → entegrasyon silinince CASCADE ile silinir) ─
INSERT INTO products (id, user_id, integration_id, name, marketplace_product_id, barcode, price, min_price, stock_quantity, currency, image_url, is_active) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-4000-8000-000000000001', 'Samsung Galaxy S24 Ultra', 'TY-SAMS24U-001', '8806095000001', 64999.00, 60000.00, 25, 'TRY', null, true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-4000-8000-000000000002', 'Apple iPhone 15 Pro Max',  'HB-IPH15PM-002', '1949000000002', 74999.00, 70000.00, 14, 'TRY', null, true),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-4000-8000-000000000001', 'Sony WH-1000XM5 Kulaklık', 'TY-SONYXM5-003', '4548736000003', 12499.00, 11000.00, 60, 'TRY', null, true),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-4000-8000-000000000002', 'Logitech MX Master 3S',    'HB-MXM3S-004',   '0971000000004',  3499.00,  3000.00, 120, 'TRY', null, true)
ON CONFLICT (id) DO NOTHING;

-- ── Rakipler ───────────────────────────────────────────────────────────────
INSERT INTO competitors (id, product_id, competitor_url, seller_name, last_price, is_active) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.trendyol.com/samsung-galaxy-s24',   'TeknoFırsat',        63499.00, true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.hepsiburada.com/samsung-galaxy-s24','HepsiBurada Mağaza', 65200.00, true),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'https://www.trendyol.com/iphone-15-pro',        'AppleStore TR',      73999.00, true),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'https://www.amazon.com.tr/sony-wh1000xm5',      'SesDünyası',         11899.00, false)
ON CONFLICT (id) DO NOTHING;

-- ── Fiyat geçmişi ──────────────────────────────────────────────────────────
INSERT INTO price_history (competitor_id, price, recorded_at) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 65999.00, now() - interval '7 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 64999.00, now() - interval '5 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 64499.00, now() - interval '3 days'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 63999.00, now() - interval '1 day'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 63499.00, now()),
  ('b1b2c3d4-0002-4000-8000-000000000002', 66500.00, now() - interval '7 days'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 65200.00, now()),
  ('b1b2c3d4-0003-4000-8000-000000000003', 76999.00, now() - interval '6 days'),
  ('b1b2c3d4-0003-4000-8000-000000000003', 73999.00, now());

-- ── Fiyatlandırma kuralları + atama ────────────────────────────────────────
INSERT INTO pricing_rules (id, user_id, rule_name, rule_type, value, unit) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Altı 1 TL',   'COMPETITOR_BASED', 1.00, 'TRY'),
  ('d0000000-0000-4000-8000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Min %15 Kâr Marjı', 'MARGIN_BASED',    15.00, '%')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rule_assignments (rule_id, target_type, target_id) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'PRODUCT', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000002', 'PRODUCT', 'a1b2c3d4-0002-4000-8000-000000000002');

-- ── Dashboard istatistikleri ───────────────────────────────────────────────
INSERT INTO dashboard_stats (user_id, buybox_win_rate, tracked_products_count, total_sales, active_campaigns, revenue)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 78.50, 145, 1250, 3, 89500.00);

-- ── Kampanya / stok eritme önerileri ───────────────────────────────────────
INSERT INTO campaign_suggestions (user_id, product_name, product_sku, current_stock, sales_velocity, days_of_stock, suggested_discount, suggestion_type, priority) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kablosuz Bluetooth Kulaklık', 'BT-KLK-001',  320,  4.5, 71, 15.00, 'stok_eritme',  'high'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'USB-C Hub Adaptör',           'USB-HUB-042',  85, 12.3,  7, 10.00, 'kampanya',     'critical'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mekanik Klavye RGB',          'MK-RGB-108',  200,  2.1, 95, 20.00, 'stok_eritme',  'medium'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ergonomik Mouse Pad',         'EMP-XL-005',  500,  8.7, 57,  5.00, 'fiyat_esleme', 'low'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '27" Gaming Monitör',          'MON-27G-144',  15,  1.8,  8, 12.00, 'kampanya',     'critical');

-- ── Bildirimler ────────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Stok Bitirdi',     'USB-C Hub Adaptör ürününde rakibiniz stok bitirdi. BuyBox şansınız arttı!', 'success', false, now() - interval '10 minutes'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fiyat Düşüşü Algılandı', 'Kablosuz Bluetooth Kulaklık ürününde rakip fiyatı %12 düşürdü.',           'warning', false, now() - interval '2 hours'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kazanıldı',       '27" Gaming Monitör ürününde BuyBox pozisyonunu kazandınız!',                'success', true,  now() - interval '1 day'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Uyarısı',           'USB-C Hub Adaptör ürününde stok 7 günlük seviyeye düştü.',                  'error',   false, now() - interval '30 minutes'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kampanya Başarılı',      'Mekanik Klavye indirim kampanyası satışları %35 artırdı.',                 'info',    true,  now() - interval '3 days');

-- ── Alarm kuralları ────────────────────────────────────────────────────────
INSERT INTO alert_rules (user_id, rule_name, condition_type, threshold_value, threshold_unit, is_active) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Fiyat Düşüşü',    'rakip_fiyat_dususu', 10.00, 'percent', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Azalması Uyarısı', 'stok_azalmasi',      50.00, 'count',   true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kaybı',          'buybox_kaybi',        1.00, 'count',   false);
