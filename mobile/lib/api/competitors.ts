// ==========================================================================
// lib/api/competitors.ts — Hamza (13-18) — mevcut imzalar KORUNUR
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { Product, Competitor, PriceHistory, DataPoint } from './types';

// Yardımcı: Ürün Listesi (GET /products)
export function getProducts(): Promise<Product[]> {
  return httpGet<Product[]>('/products');
}

// 13. POST /competitors — Rakip ürün linki ekleme
export function addCompetitor(payload: {
  productId: string;
  competitorUrl: string;
  sellerName?: string;
}): Promise<Competitor> {
  return httpPost<Competitor>('/competitors', payload);
}

// 14. POST /competitors/sync — Manuel botu çalıştırma (async, 30s timeout)
export function syncCompetitorPrices(): Promise<{ message: string; count?: number }> {
  return httpPost('/competitors/sync', undefined, { timeoutMs: 30000 });
}

// 15. GET /products/:productId/competitors — Rakip satıcılar listesi
export function getCompetitorsByProduct(productId: string): Promise<Competitor[]> {
  return httpGet<Competitor[]>(`/products/${productId}/competitors`);
}

// 16. GET /competitors/:id/history — Tarihsel fiyatlar → DataPoint[]
export async function getCompetitorHistory(competitorId: string): Promise<DataPoint[]> {
  const raw = await httpGet<PriceHistory[]>(`/competitors/${competitorId}/history`);
  return raw
    .slice()
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((h) => ({
      date: new Date(h.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      price: Number(h.price),
    }));
}

// 17. PUT /competitors/:id/status — Takip durumu güncelleme
export function updateCompetitorStatus(competitorId: string, isActive: boolean): Promise<Competitor> {
  return httpPut<Competitor>(`/competitors/${competitorId}/status`, { isActive });
}

// 18. DELETE /competitors/:id — Rakip takibini silme
export function deleteCompetitor(competitorId: string): Promise<void> {
  return httpDelete<void>(`/competitors/${competitorId}`);
}
