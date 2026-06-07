// ==========================================================================
// controllers/competitorController.js — Muhammed Hamza Çakmak (Gereksinim 13-18)
// Rakip ekle, manuel bot (sync → RabbitMQ), rakip listesi (Redis cache),
// fiyat geçmişi, takip durumu, rakip sil.
// (M-Hamza-Cakmak/api/index.js'ten pg/ESM — yanıt şekilleri AYNEN korunur.)
// ==========================================================================
import { query } from '../db/pool.js';
import { cachedQuery, invalidateCache } from '../infra/redis.js';
import { sendSyncJob, isRabbitReady } from '../infra/rabbitmq.js';
import { AppError } from '../middleware/errorHandler.js';

// Yardımcı: GET /products — ürünleri listele (Redis cache).
// Hamza'nın mevcut mobil istemcisi `current_price` bekler → price AS current_price.
export async function getProducts(req, res, next) {
  try {
    const cacheKey = `products:${req.user.id}`;
    const data = await cachedQuery(cacheKey, async () => {
      const { rows } = await query(
        `SELECT id, name, price AS current_price, image_url, min_price, stock_quantity
           FROM products
          WHERE user_id = $1 AND is_active = true
          ORDER BY name`,
        [req.user.id]
      );
      return rows;
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 13. POST /competitors — Rakip ürün linki ekleme
export async function addCompetitor(req, res, next) {
  try {
    const { productId, competitorUrl, sellerName } = req.body || {};
    if (!productId || !competitorUrl) {
      throw new AppError('productId ve competitorUrl zorunludur', 400);
    }
    const { rows } = await query(
      `INSERT INTO competitors (product_id, competitor_url, seller_name, is_active)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [productId, competitorUrl, sellerName || 'Bilinmeyen Satıcı']
    );
    await invalidateCache(`competitors:${productId}`, `products:${req.user.id}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 14. POST /competitors/sync — Manuel botu çalıştırma (RabbitMQ async)
export async function syncCompetitors(req, res, next) {
  try {
    if (isRabbitReady()) {
      const payload = { triggeredAt: new Date().toISOString(), requestedBy: req.ip || 'unknown' };
      const queued = sendSyncJob(payload);
      if (queued) {
        return res.status(202).json({
          message: 'Senkronizasyon kuyruğa alındı. Worker arka planda işleyecek.',
          queue: 'sync_jobs',
          triggeredAt: payload.triggeredAt,
        });
      }
    }
    // RabbitMQ yok → senkron fallback
    const count = await runDirectSync();
    res.status(200).json({ message: 'Senkronizasyon tamamlandı (senkron)', count });
  } catch (err) {
    next(err);
  }
}

// RabbitMQ yokken doğrudan fiyat senkronizasyonu (Kafka publish worker'ın işi)
async function runDirectSync() {
  const { rows: competitors } = await query(
    'SELECT * FROM competitors WHERE is_active = true'
  );
  let count = 0;
  for (const comp of competitors) {
    const oldPrice = Number(comp.last_price) || 1000;
    const change = (Math.random() - 0.5) * 0.04; // ±%2
    const newPrice = Math.round(oldPrice * (1 + change) * 100) / 100;
    await query(
      'UPDATE competitors SET last_price = $1, updated_at = now() WHERE id = $2',
      [newPrice, comp.id]
    );
    await query(
      'INSERT INTO price_history (competitor_id, price) VALUES ($1, $2)',
      [comp.id, newPrice]
    );
    await invalidateCache(`competitors:${comp.product_id}`);
    count++;
  }
  return count;
}

// 15. GET /products/:productId/competitors — Rakip satıcılar listesi (Redis cache)
export async function listForProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const cacheKey = `competitors:${productId}`;
    const data = await cachedQuery(cacheKey, async () => {
      const { rows } = await query(
        'SELECT * FROM competitors WHERE product_id = $1 ORDER BY created_at DESC',
        [productId]
      );
      return rows;
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 16. GET /competitors/:competitorId/history — Tarihsel fiyat logları
export async function getHistory(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM price_history WHERE competitor_id = $1 ORDER BY recorded_at ASC',
      [req.params.competitorId]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

// 17. PUT /competitors/:competitorId/status — Takip durumu güncelleme
export async function updateStatus(req, res, next) {
  try {
    const { isActive } = req.body || {};
    const { rows } = await query(
      `UPDATE competitors SET is_active = $1, updated_at = now()
        WHERE id = $2 RETURNING *`,
      [!!isActive, req.params.competitorId]
    );
    if (rows.length === 0) throw new AppError('Rakip bulunamadı', 404);
    await invalidateCache(`competitors:${rows[0].product_id}`);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 18. DELETE /competitors/:competitorId — Rakip takibini silme
export async function deleteCompetitor(req, res, next) {
  try {
    const { rows: existing } = await query(
      'SELECT product_id FROM competitors WHERE id = $1',
      [req.params.competitorId]
    );
    const { rowCount } = await query('DELETE FROM competitors WHERE id = $1', [
      req.params.competitorId,
    ]);
    if (rowCount === 0) throw new AppError('Rakip bulunamadı', 404);
    if (existing[0]?.product_id) await invalidateCache(`competitors:${existing[0].product_id}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
