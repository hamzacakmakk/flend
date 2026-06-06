// ==========================================
// M-Hamza-Cakmak REST API ile Mobil Entegrasyon
// Base URL: https://flend-backend.vercel.app
// ==========================================

const API_URL = 'https://flend-backend.vercel.app';

export interface Product {
  id: string;
  name: string;
  current_price: number;
}

export interface Competitor {
  id: string;
  product_id: string;
  competitor_url: string;
  seller_name: string;
  last_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  competitor_id: string;
  price: number;
  recorded_at: string;
}

// DataPoint — Mobil Backend Görevi 1: Zaman Serisi veri modeli
export interface DataPoint {
  date: string;
  price: number;
}

// Yardımcı: Ürün Listesi
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Ürünler getirilemedi');
  return res.json();
}

// 1. POST /competitors — Rakip Ürün Linki Ekleme
export async function addCompetitor(payload: {
  productId: string;
  competitorUrl: string;
  sellerName?: string;
}): Promise<Competitor> {
  const res = await fetch(`${API_URL}/competitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Rakip eklenemedi');
  return res.json();
}

// 2. POST /competitors/sync — Manuel Bot Çalıştırma
// Mobil Backend Görevi 2: async takip, timeout güvenli
export async function syncCompetitorPrices(): Promise<{ message: string; count: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  try {
    const res = await fetch(`${API_URL}/competitors/sync`, {
      method: 'POST',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Senkronizasyon başarısız');
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// 3. GET /products/{productId}/competitors — Rakip Satıcılar Listesi
export async function getCompetitorsByProduct(productId: string): Promise<Competitor[]> {
  const res = await fetch(`${API_URL}/products/${productId}/competitors`);
  if (!res.ok) throw new Error('Rakipler getirilemedi');
  return res.json();
}

// 4. GET /competitors/{competitorId}/history — Tarihsel Fiyat Logları
// Mobil Backend Görevi 1: JSON parse → DataPoint modeline çevirme
export async function getCompetitorHistory(competitorId: string): Promise<DataPoint[]> {
  const res = await fetch(`${API_URL}/competitors/${competitorId}/history`);
  if (!res.ok) throw new Error('Fiyat geçmişi getirilemedi');
  const raw: PriceHistory[] = await res.json();
  // Zaman serisi → DataPoint modeli
  return raw
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((h) => ({
      date: new Date(h.recorded_at).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
      }),
      price: Number(h.price),
    }));
}

// 5. PUT /competitors/{competitorId}/status — Takip Durumu Güncelleme
export async function updateCompetitorStatus(
  competitorId: string,
  isActive: boolean
): Promise<Competitor> {
  const res = await fetch(`${API_URL}/competitors/${competitorId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error('Durum güncellenemedi');
  return res.json();
}

// 6. DELETE /competitors/{competitorId} — Rakip Takibini Silme
export async function deleteCompetitor(competitorId: string): Promise<void> {
  const res = await fetch(`${API_URL}/competitors/${competitorId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Rakip silinemedi');
}
