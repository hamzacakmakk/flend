-- =============================================
-- E-Ticaret Satıcı Paneli — Supabase DDL Şeması
-- =============================================

-- UUID extension (Supabase'de varsayılan olarak aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS tablosu
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DASHBOARD_STATS tablosu
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buybox_win_rate DECIMAL(5,2) DEFAULT 0.00,        -- yüzde olarak (ör: 78.50)
    tracked_products_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    active_campaigns INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    period VARCHAR(20) DEFAULT 'daily',                -- daily, weekly, monthly
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_buybox_rate CHECK (buybox_win_rate >= 0 AND buybox_win_rate <= 100)
);

-- 3. CAMPAIGN_SUGGESTIONS tablosu
CREATE TABLE IF NOT EXISTS campaign_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    current_stock INTEGER DEFAULT 0,
    sales_velocity DECIMAL(8,2) DEFAULT 0.00,          -- günlük ortalama satış
    days_of_stock INTEGER DEFAULT 0,                    -- tahmini stok gün sayısı
    suggested_discount DECIMAL(5,2) DEFAULT 0.00,       -- önerilen indirim yüzdesi
    suggestion_type VARCHAR(50) NOT NULL DEFAULT 'stok_eritme',  -- stok_eritme, fiyat_esleme, kampanya
    priority VARCHAR(20) DEFAULT 'medium',              -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'pending',               -- pending, applied, dismissed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATIONS tablosu
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',                    -- info, warning, success, error
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ALERT_RULES tablosu
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    condition_type VARCHAR(100) NOT NULL,                -- rakip_fiyat_dususu, stok_azalmasi, buybox_kaybi, fiyat_degisimi
    threshold_value DECIMAL(10,2) NOT NULL,              -- eşik değeri (ör: %10 için 10.00)
    threshold_unit VARCHAR(20) DEFAULT 'percent',        -- percent, amount, count
    is_active BOOLEAN DEFAULT TRUE,
    notify_via VARCHAR(50) DEFAULT 'in_app',             -- in_app, email, sms
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İNDEXLER
CREATE INDEX idx_dashboard_stats_user ON dashboard_stats(user_id);
CREATE INDEX idx_campaign_suggestions_user ON campaign_suggestions(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_alert_rules_user ON alert_rules(user_id);
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active);

-- =============================================
-- DEMO VERİLER
-- =============================================

-- Demo kullanıcı
INSERT INTO users (id, email, full_name, company_name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'demo@satici.com', 'Ahmet Yılmaz', 'TechStore TR');

-- Dashboard istatistikleri
INSERT INTO dashboard_stats (user_id, buybox_win_rate, tracked_products_count, total_sales, active_campaigns, revenue)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 78.50, 145, 1250, 3, 89500.00);

-- Kampanya önerileri
INSERT INTO campaign_suggestions (user_id, product_name, product_sku, current_stock, sales_velocity, days_of_stock, suggested_discount, suggestion_type, priority)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kablosuz Bluetooth Kulaklık', 'BT-KLK-001', 320, 4.5, 71, 15.00, 'stok_eritme', 'high'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'USB-C Hub Adaptör', 'USB-HUB-042', 85, 12.3, 7, 10.00, 'kampanya', 'critical'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mekanik Klavye RGB', 'MK-RGB-108', 200, 2.1, 95, 20.00, 'stok_eritme', 'medium'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ergonomik Mouse Pad', 'EMP-XL-005', 500, 8.7, 57, 5.00, 'fiyat_esleme', 'low'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '27" Gaming Monitör', 'MON-27G-144', 15, 1.8, 8, 12.00, 'kampanya', 'critical');

-- Bildirimler
INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Stok Bitirdi', 'USB-C Hub Adaptör ürününde rakibiniz stok bitirdi. BuyBox şansınız arttı!', 'success', FALSE, NOW() - INTERVAL '10 minutes'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fiyat Düşüşü Algılandı', 'Kablosuz Bluetooth Kulaklık ürününde rakip fiyatı %12 düşürdü.', 'warning', FALSE, NOW() - INTERVAL '2 hours'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kazanıldı', '27" Gaming Monitör ürününde BuyBox pozisyonunu kazandınız!', 'success', TRUE, NOW() - INTERVAL '1 day'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Uyarısı', 'USB-C Hub Adaptör ürününde stok 7 günlük seviyeye düştü.', 'error', FALSE, NOW() - INTERVAL '30 minutes'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kampanya Başarılı', 'Mekanik Klavye indirim kampanyası satışları %35 artırdı.', 'info', TRUE, NOW() - INTERVAL '3 days');

-- Alarm kuralları
INSERT INTO alert_rules (user_id, rule_name, condition_type, threshold_value, threshold_unit, is_active)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Fiyat Düşüşü', 'rakip_fiyat_dususu', 10.00, 'percent', TRUE),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Azalması Uyarısı', 'stok_azalmasi', 50.00, 'count', TRUE),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kaybı', 'buybox_kaybi', 1.00, 'count', FALSE);
