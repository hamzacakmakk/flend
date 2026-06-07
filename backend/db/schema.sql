-- ==========================================================================
-- Flend — Birleşik PostgreSQL Şeması (tüm modüller tek veritabanında)
--
-- Kaynak şemalardan konsolide edilmiştir:
--   * M-Hamza-Cakmak/frontend/supabase-schema.sql  (products, competitors, price_history)
--   * Nurullah-Turgut/backend/sql/schema.sql        (users, dashboard_stats, campaign_suggestions, notifications, alert_rules)
--   * Kadir-Cihan-Kigilcim/supabase/setup.sql       (pricing_rules, rule_assignments)
--   * Tufan (auth) + flend_api_updated.yaml         (subscription_packages, users.password_hash)
--
-- Çakışma çözümleri:
--   * Tek `products`: Hamza (name/current_price) + Mehmet (title/sale_price/min_price/stock) BİRLEŞİK.
--   * Tek `pricing_rules`: Kadir (value/unit) + YAML (margin/isPercentage→unit='%').
--   * Supabase'e özgü RLS/POLICY satırları çıkarıldı (yerel pg için gereksiz).
--
-- Postgres docker-entrypoint-initdb.d ile otomatik yüklenir (01-schema.sql).
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ── 1. Abonelik Paketleri (Tufan) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_packages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(120) NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  period      VARCHAR(20)  NOT NULL DEFAULT 'monthly',   -- monthly | yearly | free
  features    JSONB        NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ  DEFAULT now()
);

-- ── 2. Kullanıcılar / Satıcılar (Tufan + Nurullah) ───────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    VARCHAR(255) UNIQUE NOT NULL,
  password_hash            TEXT NOT NULL,                 -- bcrypt (Tufan)
  full_name                VARCHAR(255),
  company_name             VARCHAR(255),
  phone                    VARCHAR(30),
  avatar_url               TEXT,
  subscription_package_id  UUID REFERENCES subscription_packages(id) ON DELETE SET NULL,
  status                   VARCHAR(20) DEFAULT 'active',  -- active | frozen | deleted
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Pazaryeri Entegrasyonları (Mehmet) ────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  marketplace_name  VARCHAR(120) NOT NULL,                -- Trendyol | Hepsiburada | Amazon ...
  api_key           TEXT,
  api_secret        TEXT,
  base_url          TEXT,
  status            VARCHAR(20) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Ürünler — BİRLEŞİK (Hamza + Mehmet) ───────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id          UUID REFERENCES integrations(id) ON DELETE SET NULL,  -- Mehmet
  name                    VARCHAR(255) NOT NULL,          -- Hamza name / Mehmet title
  marketplace_product_id  VARCHAR(255) UNIQUE,            -- Mehmet upsert anahtarı (NULL'lar çakışmaz)
  barcode                 VARCHAR(120),
  price                   NUMERIC(10,2) DEFAULT 0,        -- Hamza current_price / Mehmet sale_price
  min_price               NUMERIC(10,2),                  -- Mehmet (zarar eşiği)
  stock_quantity          INTEGER DEFAULT 0,              -- Mehmet
  currency                VARCHAR(8) DEFAULT 'TRY',
  image_url               TEXT,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Rakipler (Hamza) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  competitor_url  TEXT NOT NULL,
  seller_name     VARCHAR(255) NOT NULL DEFAULT 'Bilinmeyen Satıcı',
  last_price      NUMERIC(10,2),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 6. Fiyat Geçmişi (Hamza) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id  UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  price          NUMERIC(10,2) NOT NULL,
  recorded_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 7. Fiyatlandırma Kuralları — BİRLEŞİK (Kadir + YAML) ──────────────────
CREATE TABLE IF NOT EXISTS pricing_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  rule_name   VARCHAR(255) NOT NULL,
  rule_type   VARCHAR(30) NOT NULL DEFAULT 'COMPETITOR_BASED'
              CHECK (rule_type IN ('COMPETITOR_BASED', 'MARGIN_BASED')),
  value       NUMERIC NOT NULL,                            -- YAML "margin"
  unit        VARCHAR(8) NOT NULL DEFAULT 'TRY'
              CHECK (unit IN ('TRY', '%')),                -- YAML isPercentage=true → '%'
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 8. Kural Atamaları (Kadir) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rule_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id      UUID REFERENCES pricing_rules(id) ON DELETE CASCADE,
  target_type  VARCHAR(20) NOT NULL DEFAULT 'PRODUCT'
               CHECK (target_type IN ('PRODUCT', 'CATEGORY')),
  target_id    VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 9. Dashboard İstatistikleri (Nurullah) ───────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_stats (
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

-- ── 10. Kampanya / Stok Eritme Önerileri (Nurullah) ──────────────────────
CREATE TABLE IF NOT EXISTS campaign_suggestions (
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

-- ── 11. Bildirimler (Nurullah) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(50) DEFAULT 'info',                  -- info | warning | success | error
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 12. Alarm / Bildirim Kuralları (Nurullah) ────────────────────────────
CREATE TABLE IF NOT EXISTS alert_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_name        VARCHAR(255) NOT NULL,
  condition_type   VARCHAR(100) NOT NULL,                  -- rakip_fiyat_dususu | stok_azalmasi | buybox_kaybi | fiyat_degisimi
  threshold_value  DECIMAL(10,2) NOT NULL,
  threshold_unit   VARCHAR(20) DEFAULT 'percent',          -- percent | amount | count
  is_active        BOOLEAN DEFAULT true,
  notify_via       VARCHAR(50) DEFAULT 'in_app',           -- in_app | email | sms
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── İndeksler ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_user             ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_integration      ON products(integration_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user         ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_product_id    ON competitors(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_competitor  ON price_history(competitor_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded    ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_user        ON pricing_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rule_assignments_rule     ON rule_assignments(rule_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user      ON dashboard_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_suggestions_user ON campaign_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user        ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read     ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_alert_rules_user          ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active        ON alert_rules(is_active);
