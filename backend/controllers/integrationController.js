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
    const final_base_url = resolveBaseUrl(marketplace_name, base_url);
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

// DELETE /api/integrations/:id — Entegrasyonu (ve bağlı ürünleri) sil
export async function deleteIntegration(req, res, next) {
  try {
    const id = String(req.params.id).trim();
    const { rowCount } = await query(
      'DELETE FROM integrations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (rowCount === 0) throw new AppError('Entegrasyon bulunamadı', 404);
    res.status(200).json({ message: 'Entegrasyon silindi' });
  } catch (err) {
    next(err);
  }
}

// 8 (mekanizma). POST /api/integrations/:id/sync — Ürün listesini çek (simüle)
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
    // Simüle edilmiş pazaryeri kataloğu (gerçek API yerine deterministik demo veri)
    const catalog = [
      { sku: `${mp}-AKL-100`, name: `${mp} Akıllı Saat Pro`, price: 4299.0, stock: 42 },
      { sku: `${mp}-KLK-220`, name: `${mp} Bluetooth Kulaklık`, price: 899.9, stock: 130 },
      { sku: `${mp}-PWB-330`, name: `${mp} 20000mAh Powerbank`, price: 649.5, stock: 88 },
    ];

    let count = 0;
    for (const p of catalog) {
      await query(
        `INSERT INTO products (user_id, integration_id, name, marketplace_product_id, price, stock_quantity, currency, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 'TRY', true)
         ON CONFLICT (marketplace_product_id)
         DO UPDATE SET price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity, updated_at = now()`,
        [req.user.id, id, p.name, p.sku, p.price, p.stock]
      );
      count++;
    }
    // Hem envanter (Mehmet) hem rakip-takibi ürün listesi (Hamza) cache'ini temizle
    await invalidateCache(`inventory:${req.user.id}`, `products:${req.user.id}`);
    res.status(200).json({ message: 'Ürün listesi senkronize edildi', count, marketplace: mp });
  } catch (err) {
    next(err);
  }
}
