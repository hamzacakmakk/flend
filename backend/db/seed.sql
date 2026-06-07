-- ==========================================================================
-- Flend — Demo Seed Verisi (mobil uygulamanın ANINDA dolu görünmesi için)
--
-- Sabit UUID'ler kullanılır → demo/deep-link tutarlı. Tüm veri tek demo
-- kullanıcıya (a0eebc99-...-380a11) bağlıdır.
--
-- Demo giriş:  email = demo@flend.com   parola = demo1234
-- NOT: users.password_hash burada placeholder'dır; backend boot'ta
--      ensureDemoUser() ile gerçek bcrypt('demo1234') değerine güncellenir.
--
-- Postgres docker-entrypoint-initdb.d ile schema'dan SONRA yüklenir (02-seed.sql).
-- ==========================================================================

-- ── Abonelik paketleri ───────────────────────────────────────────────────
INSERT INTO subscription_packages (id, name, price, period, features) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Free',       0.00,   'free',
     '["50 ürün takibi","Manuel fiyat güncelleme"]'),
  ('c0000000-0000-4000-8000-000000000002', 'Pro Aylık',  99.99,  'monthly',
     '["Sınırsız ürün","Otomatik bot","Rakip analizi","Bildirimler"]'),
  ('c0000000-0000-4000-8000-000000000003', 'Pro Yıllık', 999.99, 'yearly',
     '["Pro Aylık tüm özellikleri","2 ay ücretsiz","Öncelikli destek"]')
ON CONFLICT (id) DO NOTHING;

-- ── Demo kullanıcı (parola boot'ta set edilir) ───────────────────────────
INSERT INTO users (id, email, password_hash, full_name, company_name, phone, subscription_package_id, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo@flend.com',
  'SET_ON_BOOT',                                   -- ensureDemoUser() bcrypt ile değiştirir
  'Ahmet Yılmaz',
  'TechStore TR',
  '+90 555 000 0000',
  'c0000000-0000-4000-8000-000000000002',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- ── Ürünler (Hamza demo ürünleri + Mehmet envanter alanları) ─────────────
INSERT INTO products (id, user_id, name, price, min_price, stock_quantity, currency, image_url, is_active) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Samsung Galaxy S24 Ultra', 64999.00, 60000.00, 25, 'TRY', null, true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apple iPhone 15 Pro Max',  74999.00, 70000.00, 14, 'TRY', null, true),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sony WH-1000XM5 Kulaklık',  12499.00, 11000.00, 60, 'TRY', null, true)
ON CONFLICT (id) DO NOTHING;

-- ── Rakipler (Hamza) ─────────────────────────────────────────────────────
INSERT INTO competitors (id, product_id, competitor_url, seller_name, last_price, is_active) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.trendyol.com/samsung-galaxy-s24',  'TeknoFırsat',        63499.00, true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://www.hepsiburada.com/samsung-galaxy-s24','HepsiBurada Mağaza', 65200.00, true),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'https://www.trendyol.com/iphone-15-pro',        'AppleStore TR',      73999.00, true),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'https://www.amazon.com.tr/sony-wh1000xm5',      'SesDünyası',         11899.00, false)
ON CONFLICT (id) DO NOTHING;

-- ── Fiyat geçmişi (Hamza) ────────────────────────────────────────────────
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

-- ── Fiyatlandırma kuralları + atama (Kadir) ──────────────────────────────
INSERT INTO pricing_rules (id, user_id, rule_name, rule_type, value, unit) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Altı 1 TL',  'COMPETITOR_BASED', 1.00, 'TRY'),
  ('d0000000-0000-4000-8000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Min %15 Kâr Marjı', 'MARGIN_BASED',    15.00, '%')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rule_assignments (rule_id, target_type, target_id) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'PRODUCT', 'a1b2c3d4-0001-4000-8000-000000000001');

-- ── Dashboard istatistikleri (Nurullah) ──────────────────────────────────
INSERT INTO dashboard_stats (user_id, buybox_win_rate, tracked_products_count, total_sales, active_campaigns, revenue)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 78.50, 145, 1250, 3, 89500.00);

-- ── Kampanya / stok eritme önerileri (Nurullah) ──────────────────────────
INSERT INTO campaign_suggestions (user_id, product_name, product_sku, current_stock, sales_velocity, days_of_stock, suggested_discount, suggestion_type, priority) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kablosuz Bluetooth Kulaklık', 'BT-KLK-001', 320, 4.5, 71, 15.00, 'stok_eritme', 'high'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'USB-C Hub Adaptör',           'USB-HUB-042', 85, 12.3, 7, 10.00, 'kampanya',   'critical'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mekanik Klavye RGB',          'MK-RGB-108', 200, 2.1, 95, 20.00, 'stok_eritme', 'medium'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ergonomik Mouse Pad',         'EMP-XL-005', 500, 8.7, 57, 5.00,  'fiyat_esleme','low'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '27" Gaming Monitör',          'MON-27G-144', 15, 1.8, 8, 12.00, 'kampanya',    'critical');

-- ── Bildirimler (Nurullah) ───────────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Stok Bitirdi',      'USB-C Hub Adaptör ürününde rakibiniz stok bitirdi. BuyBox şansınız arttı!', 'success', false, now() - interval '10 minutes'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fiyat Düşüşü Algılandı',  'Kablosuz Bluetooth Kulaklık ürününde rakip fiyatı %12 düşürdü.',           'warning', false, now() - interval '2 hours'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kazanıldı',        '27" Gaming Monitör ürününde BuyBox pozisyonunu kazandınız!',                'success', true,  now() - interval '1 day'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Uyarısı',            'USB-C Hub Adaptör ürününde stok 7 günlük seviyeye düştü.',                  'error',   false, now() - interval '30 minutes'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kampanya Başarılı',       'Mekanik Klavye indirim kampanyası satışları %35 artırdı.',                 'info',    true,  now() - interval '3 days');

-- ── Alarm kuralları (Nurullah) ───────────────────────────────────────────
INSERT INTO alert_rules (user_id, rule_name, condition_type, threshold_value, threshold_unit, is_active) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rakip Fiyat Düşüşü',     'rakip_fiyat_dususu', 10.00, 'percent', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stok Azalması Uyarısı',  'stok_azalmasi',      50.00, 'count',   true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BuyBox Kaybı',           'buybox_kaybi',        1.00, 'count',   false);
