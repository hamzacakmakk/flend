// ==========================================================================
// controllers/productController.js — Mehmet Taşcı (Gereksinim 8, 9, 10, 12)
// Envanter: ürün listesi, tekil detay, min fiyat güncelle, ürün sil.
// (Mehmet-Tasci/Flend/api/src/controllers/productController.js'ten pg/ESM)
// ==========================================================================
import { query } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { cachedQuery, invalidateCache } from '../infra/redis.js';

// 8. GET /api/inventory/products — Kendi ürün listesini çekme
export async function getAllProducts(req, res, next) {
  try {
    const { integration_id, search } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = (Math.max(parseInt(req.query.page || '1', 10), 1) - 1) * limit;

    const where = ['p.user_id = $1', 'p.is_active = true'];
    const params = [req.user.id];
    let i = 2;
    if (integration_id) { where.push(`p.integration_id = $${i++}`); params.push(integration_id); }
    if (search) {
      where.push(`(p.name ILIKE $${i} OR p.barcode ILIKE $${i} OR p.marketplace_product_id ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    params.push(limit, offset);

    const runQuery = async () => {
      const { rows } = await query(
        `SELECT p.*, i.marketplace_name
           FROM products p
           LEFT JOIN integrations i ON i.id = p.integration_id
          WHERE ${where.join(' AND ')}
          ORDER BY p.created_at DESC
          LIMIT $${i++} OFFSET $${i}`,
        params
      );
      return rows;
    };

    // Redis cache — yalnızca filtresiz ilk sayfada (en sık çağrı)
    const cacheable = !search && !integration_id && offset === 0;
    const data = cacheable
      ? await cachedQuery(`inventory:${req.user.id}`, runQuery)
      : await runQuery();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 9. GET /api/inventory/products/:id — Tekil ürün detayı
export async function getProductById(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT p.*, i.marketplace_name
         FROM products p
         LEFT JOIN integrations i ON i.id = p.integration_id
        WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) throw new AppError('Ürün bulunamadı', 404);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 10. PUT /api/inventory/products/:id/min-price — Minimum satış fiyatı güncelleme
export async function updateMinPrice(req, res, next) {
  try {
    const { min_price } = req.body || {};
    const value = Number(min_price);
    if (min_price === undefined || min_price === null || Number.isNaN(value) || value < 0) {
      throw new AppError('min_price geçerli bir pozitif sayı olmalıdır', 400);
    }
    const { rows } = await query(
      `UPDATE products SET min_price = $1, updated_at = now()
        WHERE id = $2 AND user_id = $3 RETURNING *`,
      [value, req.params.id, req.user.id]
    );
    if (rows.length === 0) throw new AppError('Ürün bulunamadı', 404);
    await invalidateCache(`inventory:${req.user.id}`);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 12. DELETE /api/inventory/products/:id — Ürünü envanterden kaldır (soft delete)
export async function deleteProduct(req, res, next) {
  try {
    const { rows } = await query(
      `UPDATE products SET is_active = false, updated_at = now()
        WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) throw new AppError('Ürün bulunamadı', 404);
    await invalidateCache(`inventory:${req.user.id}`);
    res.status(200).json({ message: 'Ürün envanterden kaldırıldı' });
  } catch (err) {
    next(err);
  }
}
