// ==========================================================================
// controllers/pricingController.js — Kadir Cihan Kığılcım (Gereksinim 19-24)
// Dinamik fiyat kuralı oluştur/listele/ata/optimum öneri/güncelle/sil.
// (setup.sql şeması + gerçek optimum-fiyat algoritması — RPC stub'ının yerine.)
// ==========================================================================
import { query } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { cachedQuery, invalidateCache } from '../infra/redis.js';

const RULE_TYPES = ['COMPETITOR_BASED', 'MARGIN_BASED'];
const UNITS = ['TRY', '%'];

// 19. POST /api/pricing-rules — Dinamik fiyatlandırma kuralı oluşturma
export async function createRule(req, res, next) {
  try {
    const b = req.body || {};
    const rule_name = b.rule_name ?? b.ruleName;
    const rule_type = b.rule_type ?? b.ruleType ?? 'COMPETITOR_BASED';
    const value = Number(b.value);
    const unit = b.unit ?? 'TRY';

    if (!rule_name) throw new AppError('rule_name (kural adı) zorunludur', 400);
    if (!RULE_TYPES.includes(rule_type)) throw new AppError(`rule_type ${RULE_TYPES.join('/')} olmalı`, 400);
    if (Number.isNaN(value)) throw new AppError('value sayısal olmalı', 400);
    if (!UNITS.includes(unit)) throw new AppError("unit 'TRY' veya '%' olmalı", 400);

    const { rows } = await query(
      `INSERT INTO pricing_rules (user_id, rule_name, rule_type, value, unit)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, rule_name, rule_type, value, unit]
    );
    await invalidateCache(`pricing:${req.user.id}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 21. GET /api/pricing-rules — Aktif kuralları listeleme (Redis cache)
export async function listRules(req, res, next) {
  try {
    const data = await cachedQuery(`pricing:${req.user.id}`, async () => {
      const { rows } = await query(
        `SELECT r.*,
                COALESCE(json_agg(json_build_object('id', a.id, 'target_type', a.target_type, 'target_id', a.target_id))
                         FILTER (WHERE a.id IS NOT NULL), '[]') AS assignments
           FROM pricing_rules r
           LEFT JOIN rule_assignments a ON a.rule_id = r.id
          WHERE r.user_id = $1
          GROUP BY r.id
          ORDER BY r.created_at DESC`,
        [req.user.id]
      );
      return rows;
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 20. POST /api/pricing-rules/:ruleId/assign — Kuralı ürüne/kategoriye atama
export async function assignRule(req, res, next) {
  try {
    const { ruleId } = req.params;
    const b = req.body || {};
    const target_type = (b.target_type ?? b.targetType ?? 'PRODUCT').toUpperCase();
    // Tek hedef veya çoklu hedef desteği
    const targets = b.target_ids ?? b.targetIds ?? (b.target_id ?? b.targetId ? [b.target_id ?? b.targetId] : []);

    if (!['PRODUCT', 'CATEGORY'].includes(target_type)) throw new AppError("target_type 'PRODUCT'/'CATEGORY' olmalı", 400);
    if (!Array.isArray(targets) || targets.length === 0) throw new AppError('En az bir hedef (target_id) gerekli', 400);

    const rule = await query('SELECT id FROM pricing_rules WHERE id = $1 AND user_id = $2', [ruleId, req.user.id]);
    if (rule.rowCount === 0) throw new AppError('Kural bulunamadı', 404);

    const created = [];
    for (const t of targets) {
      const { rows } = await query(
        `INSERT INTO rule_assignments (rule_id, target_type, target_id)
         VALUES ($1, $2, $3) RETURNING *`,
        [ruleId, target_type, String(t)]
      );
      created.push(rows[0]);
    }
    await invalidateCache(`pricing:${req.user.id}`);
    res.status(201).json({ message: 'Kural atandı', assignments: created });
  } catch (err) {
    next(err);
  }
}

// 22. GET /api/pricing-rules/optimum-price/:productId — Optimum BuyBox fiyat önerisi
export async function suggestPrice(req, res, next) {
  try {
    const { productId } = req.params;
    const prod = await query(
      'SELECT id, name, price, min_price, currency FROM products WHERE id = $1',
      [productId]
    );
    const product = prod.rows[0];
    if (!product) throw new AppError('Ürün bulunamadı', 404);

    const currentPrice = Number(product.price) || 0;
    const minPrice = product.min_price != null ? Number(product.min_price) : currentPrice * 0.8;
    const currency = product.currency || 'TRY';

    // En düşük aktif rakip fiyatı
    const comp = await query(
      `SELECT MIN(last_price) AS lowest FROM competitors
        WHERE product_id = $1 AND is_active = true AND last_price IS NOT NULL`,
      [productId]
    );
    const lowestCompetitor = comp.rows[0].lowest != null ? Number(comp.rows[0].lowest) : null;

    // Ürüne atanmış kuralı bul
    const ruleRes = await query(
      `SELECT r.* FROM rule_assignments a
         JOIN pricing_rules r ON r.id = a.rule_id
        WHERE a.target_type = 'PRODUCT' AND a.target_id = $1
        ORDER BY r.created_at DESC LIMIT 1`,
      [productId]
    );
    const rule = ruleRes.rows[0] || null;

    let suggestedPrice;
    let reason;

    if (rule && rule.rule_type === 'COMPETITOR_BASED' && lowestCompetitor != null) {
      const delta = rule.unit === '%' ? lowestCompetitor * (Number(rule.value) / 100) : Number(rule.value);
      suggestedPrice = lowestCompetitor - delta;
      reason = `"${rule.rule_name}" kuralı: en düşük rakip ${lowestCompetitor.toFixed(2)} ${currency}, ${rule.value}${rule.unit} altına çekildi.`;
    } else if (rule && rule.rule_type === 'MARGIN_BASED') {
      suggestedPrice = rule.unit === '%' ? minPrice * (1 + Number(rule.value) / 100) : minPrice + Number(rule.value);
      reason = `"${rule.rule_name}" kuralı: maliyet eşiği ${minPrice.toFixed(2)} ${currency} üzerine ${rule.value}${rule.unit} kâr marjı eklendi.`;
    } else if (lowestCompetitor != null) {
      suggestedPrice = lowestCompetitor - 1;
      reason = `Atanmış kural yok. Varsayılan strateji: en düşük rakip (${lowestCompetitor.toFixed(2)} ${currency}) altı 1 ${currency}.`;
    } else {
      suggestedPrice = currentPrice;
      reason = 'Aktif rakip verisi ve kural yok. Mevcut fiyat korunuyor.';
    }

    // Maliyet altına inme
    if (suggestedPrice < minPrice) {
      suggestedPrice = minPrice;
      reason += ` Maliyet eşiğinin (${minPrice.toFixed(2)} ${currency}) altına inilmedi.`;
    }
    suggestedPrice = Math.round(suggestedPrice * 100) / 100;

    res.status(200).json({
      productId,
      currentPrice,
      minPrice: Math.round(minPrice * 100) / 100,
      lowestCompetitorPrice: lowestCompetitor,
      suggestedPrice,
      currency,
      ruleApplied: rule ? rule.rule_name : null,
      reason,
    });
  } catch (err) {
    next(err);
  }
}

// 23. PUT /api/pricing-rules/:ruleId — Kuralı güncelleme
export async function updateRule(req, res, next) {
  try {
    const { ruleId } = req.params;
    const b = req.body || {};
    const fields = [];
    const params = [];
    let i = 1;
    if ((b.rule_name ?? b.ruleName) !== undefined) { fields.push(`rule_name = $${i++}`); params.push(b.rule_name ?? b.ruleName); }
    if ((b.rule_type ?? b.ruleType) !== undefined) {
      const rt = b.rule_type ?? b.ruleType;
      if (!RULE_TYPES.includes(rt)) throw new AppError(`rule_type ${RULE_TYPES.join('/')} olmalı`, 400);
      fields.push(`rule_type = $${i++}`); params.push(rt);
    }
    if (b.value !== undefined) { fields.push(`value = $${i++}`); params.push(Number(b.value)); }
    if (b.unit !== undefined) {
      if (!UNITS.includes(b.unit)) throw new AppError("unit 'TRY' veya '%' olmalı", 400);
      fields.push(`unit = $${i++}`); params.push(b.unit);
    }
    if (fields.length === 0) throw new AppError('Güncellenecek alan yok', 400);

    fields.push('updated_at = now()');
    params.push(ruleId, req.user.id);
    const { rows } = await query(
      `UPDATE pricing_rules SET ${fields.join(', ')}
        WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
      params
    );
    if (rows.length === 0) throw new AppError('Kural bulunamadı', 404);
    await invalidateCache(`pricing:${req.user.id}`);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 24. DELETE /api/pricing-rules/:ruleId — Kuralı silme (atamalar cascade)
export async function deleteRule(req, res, next) {
  try {
    const { rowCount } = await query(
      'DELETE FROM pricing_rules WHERE id = $1 AND user_id = $2',
      [req.params.ruleId, req.user.id]
    );
    if (rowCount === 0) throw new AppError('Kural bulunamadı', 404);
    await invalidateCache(`pricing:${req.user.id}`);
    res.status(200).json({ message: 'Kural silindi' });
  } catch (err) {
    next(err);
  }
}
