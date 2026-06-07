// ==========================================================================
// lib/api/dashboard.ts — Nurullah (25-26) — istatistik + kampanya önerileri
// ==========================================================================
import { httpGet } from '../http';
import type { DashboardStats, CampaignSuggestion } from './types';

// 25. GET /api/dashboard/stats — Özet istatistikler
export function getDashboardStats(): Promise<DashboardStats> {
  return httpGet<DashboardStats>('/api/dashboard/stats');
}

// 26. GET /api/analytics/suggestions — Stok eritme / kampanya önerileri
export function getSuggestions(): Promise<CampaignSuggestion[]> {
  return httpGet<CampaignSuggestion[]>('/api/analytics/suggestions');
}
