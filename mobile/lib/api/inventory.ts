// ==========================================================================
// lib/api/inventory.ts — Mehmet (7-12) — entegrasyon + envanter
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { Integration, InventoryProduct } from './types';

// 7. POST /api/integrations — Pazaryeri entegrasyonu ekleme
export function addIntegration(input: {
  marketplace_name: string;
  api_key: string;
  api_secret?: string;
  base_url?: string;
}): Promise<Integration> {
  return httpPost<Integration>('/api/integrations', input);
}

export function listIntegrations(): Promise<Integration[]> {
  return httpGet<Integration[]>('/api/integrations');
}

// 11. PUT /api/integrations/:id — API bilgilerini güncelleme
export function updateIntegration(id: string, input: Partial<{
  marketplace_name: string;
  api_key: string;
  api_secret: string;
  base_url: string;
  status: string;
}>): Promise<Integration> {
  return httpPut<Integration>(`/api/integrations/${id}`, input);
}

export function deleteIntegration(id: string): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/api/integrations/${id}`);
}

// 8 (mekanizma). POST /api/integrations/:id/sync — Ürün listesini çek
export function syncIntegration(id: string): Promise<{ message: string; count: number; marketplace: string }> {
  return httpPost(`/api/integrations/${id}/sync`, undefined, { timeoutMs: 30000 });
}

// 8. GET /api/inventory/products — Kendi ürün listesi
export function getInventoryProducts(search?: string): Promise<InventoryProduct[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return httpGet<InventoryProduct[]>(`/api/inventory/products${q}`);
}

// 9. GET /api/inventory/products/:id — Tekil ürün detayı
export function getInventoryProduct(id: string): Promise<InventoryProduct> {
  return httpGet<InventoryProduct>(`/api/inventory/products/${id}`);
}

// 10. PUT /api/inventory/products/:id/min-price — Min fiyat güncelle
export function updateMinPrice(id: string, min_price: number): Promise<InventoryProduct> {
  return httpPut<InventoryProduct>(`/api/inventory/products/${id}/min-price`, { min_price });
}

// 12. DELETE /api/inventory/products/:id — Ürünü sil
export function deleteInventoryProduct(id: string): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/api/inventory/products/${id}`);
}
