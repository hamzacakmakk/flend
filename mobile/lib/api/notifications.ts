// ==========================================================================
// lib/api/notifications.ts — Nurullah (27-30) — bildirim + alarm kuralı
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { AppNotification, AlertRule } from './types';

// 27. GET /api/notifications — Geçmiş bildirimler
export function getNotifications(): Promise<AppNotification[]> {
  return httpGet<AppNotification[]>('/api/notifications');
}

// 28. POST /api/alerts/rules — Alarm/bildirim kuralı oluşturma
export function createAlertRule(input: {
  ruleName: string;
  conditionType: string;
  thresholdValue: number;
  thresholdUnit?: string;
  notifyVia?: string;
}): Promise<AlertRule> {
  return httpPost<AlertRule>('/api/alerts/rules', input);
}

export function listAlertRules(): Promise<AlertRule[]> {
  return httpGet<AlertRule[]>('/api/alerts/rules');
}

// 29. PUT /api/notifications/:id/read — Okundu işaretle
export function markNotificationRead(id: string): Promise<AppNotification> {
  return httpPut<AppNotification>(`/api/notifications/${id}/read`);
}

// 30. DELETE /api/notifications/:id — Bildirim sil
export function deleteNotification(id: string): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/api/notifications/${id}`);
}
