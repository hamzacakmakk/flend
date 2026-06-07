// ==========================================================================
// controllers/analyticsController.js — Nurullah Turgut (Gereksinim 25-26)
// Özet istatistikler (dashboard) + stok eritme/kampanya önerileri.
// (Nurullah-Turgut/backend/controllers/{dashboard,campaign}Controller.js'ten pg/ESM)
// ==========================================================================
import { query } from '../db/pool.js';
import { cachedQuery } from '../infra/redis.js';

// 25. GET /api/dashboard/stats — Özet istatistikleri getirme (Redis cache)
export async function getDashboard(req, res, next) {
  try {
    const data = await cachedQuery(`dashboard:${req.user.id}`, async () => {
      const { rows } = await query(
        `SELECT * FROM dashboard_stats
          WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [req.user.id]
      );
      if (rows[0]) return rows[0];

      // Kayıt yoksa canlı sayımlardan üret
      const live = await query(
        `SELECT
           (SELECT COUNT(*) FROM products    WHERE user_id = $1 AND is_active = true)        AS tracked_products_count,
           (SELECT COUNT(*) FROM competitors c JOIN products p ON p.id = c.product_id
              WHERE p.user_id = $1 AND c.is_active = true)                                    AS active_competitors`,
        [req.user.id]
      );
      return {
        user_id: req.user.id,
        buybox_win_rate: 0,
        tracked_products_count: Number(live.rows[0].tracked_products_count),
        total_sales: 0,
        active_campaigns: 0,
        revenue: 0,
        active_competitors: Number(live.rows[0].active_competitors),
      };
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 26. GET /api/analytics/suggestions — Stok eritme / kampanya önerileri
export async function getCampaignSuggestions(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM campaign_suggestions
        WHERE user_id = $1 AND status = 'pending'
        ORDER BY CASE priority
                   WHEN 'critical' THEN 0 WHEN 'high' THEN 1
                   WHEN 'medium' THEN 2 ELSE 3 END,
                 created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
