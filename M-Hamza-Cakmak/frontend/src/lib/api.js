// ==========================================
// M-Hamza-Cakmak REST API ile Frontend Entegrasyonu
// ==========================================

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
// Remove trailing slash if present
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl

// 1. POST /competitors - Rakip Ürün Linki Ekleme
export async function addCompetitor({ productId, competitorUrl, sellerName }) {
  const response = await fetch(`${API_URL}/competitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, competitorUrl, sellerName })
  })
  if (!response.ok) throw new Error('Rakip eklenemedi')
  return response.json()
}

// 2. POST /competitors/sync - Manuel Bot Çalıştırma
export async function syncCompetitorPrices() {
  const response = await fetch(`${API_URL}/competitors/sync`, {
    method: 'POST'
  })
  if (!response.ok) throw new Error('Senkronizasyon başarısız')
  return response.json()
}

// 3. GET /products/{productId}/competitors - Rakip Listesi
export async function getCompetitorsByProduct(productId) {
  const response = await fetch(`${API_URL}/products/${productId}/competitors`)
  if (!response.ok) throw new Error('Rakipler getirilemedi')
  return response.json()
}

// 4. GET /competitors/{competitorId}/history - Fiyat Geçmişi
export async function getCompetitorHistory(competitorId) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}/history`)
  if (!response.ok) throw new Error('Fiyat geçmişi getirilemedi')
  return response.json()
}

// 5. PUT /competitors/{competitorId}/status - Durum Güncelle
export async function updateCompetitorStatus(competitorId, isActive) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  })
  if (!response.ok) throw new Error('Durum güncellenemedi')
  return response.json()
}

// 6. DELETE /competitors/{competitorId} - Rakip Silme
export async function deleteCompetitor(competitorId) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Rakip silinemedi')
}

// Yardımcı: Ürün Listesi
export async function getProducts() {
  const response = await fetch(`${API_URL}/products`)
  if (!response.ok) throw new Error('Ürünler getirilemedi')
  return response.json()
}
