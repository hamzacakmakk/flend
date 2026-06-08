// ==========================================================================
// lib/api/competitors.ts — Hamza (13-18) — mevcut imzalar KORUNUR
// Backend ulaşılamazsa demo verisi döner (hocaya sunum için).
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { Product, Competitor, PriceHistory, DataPoint } from './types';

// ── Demo fallback verisi (seed.sql ile uyumlu) ──────────────────────────
const DEMO_PRODUCTS: Product[] = [
  { id: 'a1b2c3d4-0001-4000-8000-000000000001', name: 'Samsung Galaxy S24 Ultra', current_price: 64999.00, image_url: null, min_price: 60000.00, stock_quantity: 25 },
  { id: 'a1b2c3d4-0002-4000-8000-000000000002', name: 'Apple iPhone 15 Pro Max',  current_price: 74999.00, image_url: null, min_price: 70000.00, stock_quantity: 14 },
  { id: 'a1b2c3d4-0003-4000-8000-000000000003', name: 'Sony WH-1000XM5 Kulaklık',  current_price: 12499.00, image_url: null, min_price: 11000.00, stock_quantity: 60 },
];

const now = Date.now();
const DAY = 86400000;

const DEMO_COMPETITORS: Competitor[] = [
  { id: 'b1b2c3d4-0001-4000-8000-000000000001', product_id: 'a1b2c3d4-0001-4000-8000-000000000001', competitor_url: 'https://www.trendyol.com/samsung-galaxy-s24',   seller_name: 'TeknoFırsat',        last_price: 63499.00, is_active: true,  created_at: new Date(now - 7 * DAY).toISOString(), updated_at: new Date().toISOString() },
  { id: 'b1b2c3d4-0002-4000-8000-000000000002', product_id: 'a1b2c3d4-0001-4000-8000-000000000001', competitor_url: 'https://www.hepsiburada.com/samsung-galaxy-s24', seller_name: 'HepsiBurada Mağaza', last_price: 65200.00, is_active: true,  created_at: new Date(now - 5 * DAY).toISOString(), updated_at: new Date().toISOString() },
  { id: 'b1b2c3d4-0003-4000-8000-000000000003', product_id: 'a1b2c3d4-0002-4000-8000-000000000002', competitor_url: 'https://www.trendyol.com/iphone-15-pro',         seller_name: 'AppleStore TR',      last_price: 73999.00, is_active: true,  created_at: new Date(now - 6 * DAY).toISOString(), updated_at: new Date().toISOString() },
  { id: 'b1b2c3d4-0004-4000-8000-000000000004', product_id: 'a1b2c3d4-0003-4000-8000-000000000003', competitor_url: 'https://www.amazon.com.tr/sony-wh1000xm5',       seller_name: 'SesDünyası',         last_price: 11899.00, is_active: false, created_at: new Date(now - 4 * DAY).toISOString(), updated_at: new Date().toISOString() },
];

const DEMO_HISTORY: Record<string, DataPoint[]> = {
  'b1b2c3d4-0001-4000-8000-000000000001': [
    { date: '01.06', price: 65999 }, { date: '03.06', price: 64999 },
    { date: '05.06', price: 64499 }, { date: '07.06', price: 63999 },
    { date: '08.06', price: 63499 },
  ],
  'b1b2c3d4-0002-4000-8000-000000000002': [
    { date: '01.06', price: 66500 }, { date: '04.06', price: 66000 },
    { date: '06.06', price: 65500 }, { date: '08.06', price: 65200 },
  ],
  'b1b2c3d4-0003-4000-8000-000000000003': [
    { date: '02.06', price: 76999 }, { date: '05.06', price: 75499 },
    { date: '08.06', price: 73999 },
  ],
  'b1b2c3d4-0004-4000-8000-000000000004': [
    { date: '03.06', price: 12299 }, { date: '06.06', price: 12099 },
    { date: '08.06', price: 11899 },
  ],
};

// In-memory state for demo mode mutations
let demoCompetitors = [...DEMO_COMPETITORS];

async function tryApi<T>(apiFn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    console.log('[DEMO] Backend ulaşılamıyor, demo verisi kullanılıyor');
    return fallback();
  }
}

// Yardımcı: Ürün Listesi (GET /products)
export function getProducts(): Promise<Product[]> {
  return tryApi(
    () => httpGet<Product[]>('/products'),
    () => DEMO_PRODUCTS,
  );
}

// 13. POST /competitors — Rakip ürün linki ekleme
export function addCompetitor(payload: {
  productId: string;
  competitorUrl: string;
  sellerName?: string;
}): Promise<Competitor> {
  return tryApi(
    () => httpPost<Competitor>('/competitors', payload),
    () => {
      const c: Competitor = {
        id: `demo-${Date.now()}`,
        product_id: payload.productId,
        competitor_url: payload.competitorUrl,
        seller_name: payload.sellerName || 'Yeni Satıcı',
        last_price: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoCompetitors.push(c);
      return c;
    },
  );
}

// 14. POST /competitors/sync — Manuel botu çalıştırma (async, 30s timeout)
export function syncCompetitorPrices(): Promise<{ message: string; count?: number }> {
  return tryApi(
    () => httpPost('/competitors/sync', undefined, { timeoutMs: 30000 }),
    () => {
      demoCompetitors = demoCompetitors.map((c) => {
        const base = Number(c.last_price) || 50000;
        const change = (Math.random() - 0.5) * 0.04;
        return { ...c, last_price: Math.round(base * (1 + change) * 100) / 100, updated_at: new Date().toISOString() };
      });
      return { message: 'Senkronizasyon tamamlandı (demo)', count: demoCompetitors.length };
    },
  );
}

// 15. GET /products/:productId/competitors — Rakip satıcılar listesi
export function getCompetitorsByProduct(productId: string): Promise<Competitor[]> {
  return tryApi(
    () => httpGet<Competitor[]>(`/products/${productId}/competitors`),
    () => demoCompetitors.filter((c) => c.product_id === productId),
  );
}

// 16. GET /competitors/:id/history — Tarihsel fiyatlar → DataPoint[]
export async function getCompetitorHistory(competitorId: string): Promise<DataPoint[]> {
  return tryApi(
    async () => {
      const raw = await httpGet<PriceHistory[]>(`/competitors/${competitorId}/history`);
      return raw
        .slice()
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
        .map((h) => ({
          date: new Date(h.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
          price: Number(h.price),
        }));
    },
    () => DEMO_HISTORY[competitorId] ?? [
      { date: '03.06', price: 50000 }, { date: '05.06', price: 49500 },
      { date: '08.06', price: 49000 },
    ],
  );
}

// 17. PUT /competitors/:id/status — Takip durumu güncelleme
export function updateCompetitorStatus(competitorId: string, isActive: boolean): Promise<Competitor> {
  return tryApi(
    () => httpPut<Competitor>(`/competitors/${competitorId}/status`, { isActive }),
    () => {
      demoCompetitors = demoCompetitors.map((c) =>
        c.id === competitorId ? { ...c, is_active: isActive } : c
      );
      return demoCompetitors.find((c) => c.id === competitorId)!;
    },
  );
}

// 18. DELETE /competitors/:id — Rakip takibini silme
export function deleteCompetitor(competitorId: string): Promise<void> {
  return tryApi(
    () => httpDelete<void>(`/competitors/${competitorId}`),
    () => {
      demoCompetitors = demoCompetitors.filter((c) => c.id !== competitorId);
      return undefined as unknown as void;
    },
  );
}
