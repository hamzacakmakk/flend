// ==========================================================================
// controllers/notificationController.js — Nurullah Turgut (Gereksinim 27-30)
// Bildirim listesi, alarm kuralı oluştur, bildirim okundu, bildirim sil.
// (Nurullah-Turgut/backend/controllers/{notification,alert}Controller.js'ten pg/ESM)
// ==========================================================================
import { query } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSyncJob, isRabbitReady } from '../infra/rabbitmq.js';

// 27. GET /api/notifications — Geçmiş bildirimleri listeleme
export async function getAll(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

// 28. POST /api/alerts/rules — Alarm/bildirim kuralı oluşturma
export async function createAlertRule(req, res, next) {
  try {
    const b = req.body || {};
    const rule_name = b.rule_name ?? b.ruleName;
    const condition_type = b.condition_type ?? b.conditionType;
    const threshold_value = Number(b.threshold_value ?? b.thresholdValue);
    const threshold_unit = b.threshold_unit ?? b.thresholdUnit ?? 'percent';
    const notify_via = b.notify_via ?? b.notifyVia ?? 'in_app';

    if (!rule_name) throw new AppError('rule_name (kural adı) zorunludur', 400);
    if (!condition_type) throw new AppError('condition_type zorunludur', 400);
    if (Number.isNaN(threshold_value)) throw new AppError('threshold_value sayısal olmalı', 400);

    const { rows } = await query(
      `INSERT INTO alert_rules (user_id, rule_name, condition_type, threshold_value, threshold_unit, notify_via, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [req.user.id, rule_name, condition_type, threshold_value, threshold_unit, notify_via]
    );
    const rule = rows[0];

    // Kural oluşturulunca değerlendirmeyi RabbitMQ'ya bırak (async). Worker
    // "alert_check" işini tüketip kuralı değerlendirir ve bildirim üretir.
    let notifyQueued = false;
    if (isRabbitReady()) {
      notifyQueued = sendSyncJob({
        type: 'alert_check',
        ruleId: rule.id,
        userId: req.user.id,
        triggeredAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ ...rule, notifyQueued });
  } catch (err) {
    next(err);
  }
}

// 29. PUT /api/notifications/:id/read — Bildirimi okundu olarak işaretleme
export async function markAsRead(req, res, next) {
  try {
    const { rows } = await query(
      `UPDATE notifications SET is_read = true
        WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) throw new AppError('Bildirim bulunamadı', 404);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// 30. DELETE /api/notifications/:id — Bildirimi silme
export async function deleteNotification(req, res, next) {
  try {
    const { rowCount } = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) throw new AppError('Bildirim bulunamadı', 404);
    res.status(200).json({ message: 'Bildirim silindi' });
  } catch (err) {
    next(err);
  }
}

// Yardımcı: GET /api/alerts/rules — Alarm kurallarını listele (bildirim ekranı için)
export async function listAlertRules(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM alert_rules WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
