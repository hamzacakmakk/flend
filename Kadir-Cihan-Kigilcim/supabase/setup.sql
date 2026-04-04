-- Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name VARCHAR NOT NULL,
    rule_type VARCHAR NOT NULL CHECK (rule_type IN ('COMPETITOR_BASED', 'MARGIN_BASED')),
    value DECIMAL NOT NULL,
    unit VARCHAR NOT NULL CHECK (unit IN ('TRY', '%')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Rule Assignments Table
CREATE TABLE IF NOT EXISTS rule_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID REFERENCES pricing_rules(id) ON DELETE CASCADE,
    target_type VARCHAR NOT NULL CHECK (target_type IN ('PRODUCT', 'CATEGORY')),
    target_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC Function: get_optimum_price
-- Bu fonksiyon veritabanı içerisinde çalışan ve REST üzerinden /rest/v1/rpc/get_optimum_price olarak tetiklenebilen bir edge hesaplama örneğidir.
CREATE OR REPLACE FUNCTION get_optimum_price(product_id_param VARCHAR)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Örnek bir algoritma: Ürünün piyasa fiyatı vs hesaplanır...
    result := json_build_object(
        'productId', product_id_param,
        'suggestedPrice', 150.50,
        'currency', 'TRY',
        'reason', 'Rakip fiyatı 155.00 TRY bulundu, stratejinize göre 150.50 TRY hesaplandı.'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql;
