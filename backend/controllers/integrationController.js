// ==========================================================================
// controllers/integrationController.js — Mehmet Taşcı (Gereksinim 7, 11)
// Pazaryeri entegrasyonu ekleme/güncelleme + simüle ürün senkronizasyonu.
// (Mehmet-Tasci/Flend/api/src/controllers/integrationController.js'ten pg/ESM)
//
// Not: Orijinal kod gerçek pazaryeri API'sine axios ile bağlanıyordu. Yerel
// demo'da gerçek API kimliği olmadığından, sync simüle edilmiş bir katalog
// üretir — böylece "ürün listesini çekme" akışı internetsiz çalışır.
// ==========================================================================
import { query } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { invalidateCache } from '../infra/redis.js';

function resolveBaseUrl(marketplace_name, base_url) {
  if (base_url) return base_url;
  const mp = (marketplace_name || '').toLowerCase();
  if (mp.includes('trendyol')) return 'https://api.trendyol.com/sapigw';
  if (mp.includes('hepsiburada')) return 'https://mpop.hepsiburada.com/api';
  if (mp.includes('amazon')) return 'https://sellingpartnerapi-eu.amazon.com';
  return 'https://example-marketplace.local/api';
}

// 7. POST /api/integrations — Pazaryeri API entegrasyonu ekleme
export async function createIntegration(req, res, next) {
  try {
    const { marketplace_name, api_key, api_secret, base_url } = req.body || {};
    if (!marketplace_name || !api_key) {
      throw new AppError('Pazaryeri adı (marketplace_name) ve API Key zorunludur', 400);
    }
    // base_url verilmezse NULL bırakılır; sync sırasında api_key'in (Supabase JWT)
    // ref'inden otomatik türetilir. Böylece kullanıcı SADECE api_key girebilir.
    const final_base_url = (base_url && String(base_url).trim()) || null;
    const { rows } = await query(
      `INSERT INTO integrations (user_id, marketplace_name, api_key, api_secret, base_url, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [req.user.id, marketplace_name, api_key, api_secret || null, final_base_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/integrations — Kullanıcının entegrasyonları (yardımcı)
export async function listIntegrations(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM integrations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

// 11. PUT /api/integrations/:id — Pazaryeri API bilgilerini güncelleme
export async function updateIntegration(req, res, next) {
  try {
    const id = String(req.params.id).trim();
    const { marketplace_name, api_key, api_secret, base_url, status } = req.body || {};

    const fields = [];
    const params = [];
    let i = 1;
    if (marketplace_name !== undefined) { fields.push(`marketplace_name = $${i++}`); params.push(marketplace_name); }
    if (api_key !== undefined)          { fields.push(`api_key = $${i++}`);          params.push(api_key); }
    if (api_secret !== undefined)       { fields.push(`api_secret = $${i++}`);       params.push(api_secret); }
    if (base_url !== undefined)         { fields.push(`base_url = $${i++}`);         params.push(base_url); }
    if (status !== undefined)           { fields.push(`status = $${i++}`);           params.push(status); }
    if (fields.length === 0) throw new AppError('Güncellenecek alan yok', 400);

    params.push(id, req.user.id);
    const { rows } = await query(
      `UPDATE integrations SET ${fields.join(', ')}
        WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
      params
    );
    if (rows.length === 0) throw new AppError('Entegrasyon bulunamadı', 404);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/integrations/:id — Entegrasyonu sil; ürünleri DB'de TUT, sadece
// envanterden gizle (soft-delete). İstenen davranış: ürün DB'de kalsın ama
// envanter ekranında görünmesin.
export async function deleteIntegration(req, res, next) {
  try {
    const id = String(req.params.id).trim();
    // Bu entegrasyonun ürünlerini envanterden gizle (is_active=false) — SİLME.
    // products.integration_id FK'si ON DELETE SET NULL olduğundan, entegrasyon
    // silinince ürünler DB'de kalır (integration_id NULL olur), kayıt kaybolmaz.
    await query(
      'UPDATE products SET is_active = false, updated_at = now() WHERE integration_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    const { rowCount } = await query(
      'DELETE FROM integrations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (rowCount === 0) throw new AppError('Entegrasyon bulunamadı', 404);
    // Envanter / ürün listesi cache'ini temizle ki mobil tarafta da düşsün
    await invalidateCache(`inventory:${req.user.id}`, `products:${req.user.id}`);
    res.status(200).json({ message: 'Entegrasyon silindi, ürünler envanterden kaldırıldı (DB\'de korundu)' });
  } catch (err) {
    next(err);
  }
}

// Supabase anon/service JWT'sinin payload'ından proje "ref"ini çözer.
// Böylece sadece api_key girilerek URL otomatik türetilebilir.
function supabaseRefFromKey(apiKey) {
  try {
    const payload = String(apiKey).split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return json.ref || null;
  } catch {
    return null;
  }
}

// Supabase REST endpoint'ini base_url'den (yoksa api_key'in ref'inden) türetir.
// Kabul edilen base_url biçimleri:
//   (boş — api_key'in JWT ref'inden otomatik)
//   https://<proje>.supabase.co
//   https://<proje>.supabase.co/rest/v1
//   https://<proje>.supabase.co/rest/v1/products
//   https://<proje>.supabase.co/rest/v1/products?select=*
function buildCatalogUrl(baseUrl, apiKey) {
  let url = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!url) {
    // base_url verilmemiş → api_key'in JWT ref'inden Supabase URL'ini türet
    const ref = supabaseRefFromKey(apiKey);
    if (!ref) throw new AppError('base_url yok ve api_key bir Supabase JWT değil — URL türetilemedi', 400);
    url = `https://${ref}.supabase.co`;
  }
  if (!/\/rest\/v1(\/|$)/.test(url)) url += '/rest/v1';
  if (!/\/rest\/v1\/[^/?]+/.test(url)) url += '/products';   // tablo verilmemişse products
  if (!/[?&]select=/.test(url)) url += (url.includes('?') ? '&' : '?') + 'select=*';
  return url;
}

// 8 (mekanizma). POST /api/integrations/:id/sync
// Ürünleri entegrasyonun KAYNAK Supabase DB'sinden (base_url + api_key) GERÇEKTEN
// çeker ve ana DB'deki products tablosuna upsert eder.
export async function syncProducts(req, res, next) {
  try {
    const id = String(req.params.id).trim();
    const { rows: ints } = await query(
      'SELECT * FROM integrations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    const integration = ints[0];
    if (!integration) throw new AppError('Entegrasyon bulunamadı', 404);

    const mp = integration.marketplace_name;
    const apiKey = integration.api_key;
    if (!apiKey) throw new AppError('Entegrasyonda api_key (Supabase anon key) tanımlı değil', 400);

    // Kaynak Supabase products tablosunu REST ile çek
    const catalogUrl = buildCatalogUrl(integration.base_url, apiKey);
    let resp;
    try {
      resp = await fetch(catalogUrl, {
        headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      });
    } catch (e) {
      throw new AppError(`Kaynak Supabase'e ulaşılamadı: ${e.message}`, 502);
    }
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new AppError(`Kaynak Supabase hatası (${resp.status}): ${body.slice(0, 200)}`, 502);
    }
    const remote = await resp.json();
    if (!Array.isArray(remote)) throw new AppError('Kaynak Supabase beklenen ürün dizisini döndürmedi', 502);

    // Kaynaktaki alan adlarını ana DB şemasına eşle (esnek isimlendirme)
    const catalog = remote.map((r) => ({
      sku:   r.marketplace_product_id ?? r.sku ?? r.id,
      name:  r.name ?? r.title ?? 'İsimsiz ürün',
      price: Number(r.price ?? r.sale_price ?? r.current_price ?? 0),
      stock: Number(r.stock_quantity ?? r.stock ?? 0),
      currency: r.currency ?? 'TRY',
      barcode:  r.barcode ?? null,
    })).filter((p) => p.sku);   // SKU'su olmayan kayıtları atla (upsert anahtarı)

    let count = 0;
    for (const p of catalog) {
      await query(
        `INSERT INTO products (user_id, integration_id, name, marketplace_product_id, barcode, price, stock_quantity, currency, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT (marketplace_product_id)
         DO UPDATE SET name = EXCLUDED.name, barcode = EXCLUDED.barcode,
                       price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity,
                       integration_id = EXCLUDED.integration_id, is_active = true, updated_at = now()`,
        [req.user.id, id, p.name, String(p.sku), p.barcode, p.price, p.stock, p.currency]
      );
      count++;
    }
    // Hem envanter (Mehmet) hem rakip-takibi ürün listesi (Hamza) cache'ini temizle
    await invalidateCache(`inventory:${req.user.id}`, `products:${req.user.id}`);
    res.status(200).json({ message: 'Ürün listesi senkronize edildi', count, marketplace: mp, source: catalogUrl });
  } catch (err) {
    next(err);
  }
}
