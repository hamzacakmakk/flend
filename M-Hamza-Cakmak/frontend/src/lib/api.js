import { supabase } from './supabase'

// ==========================================
// 1. POST /competitors - Rakip Ürün Linki Ekleme
// ==========================================
export async function addCompetitor({ productId, competitorUrl, sellerName }) {
  const { data, error } = await supabase
    .from('competitors')
    .insert({
      product_id: productId,
      competitor_url: competitorUrl,
      seller_name: sellerName || 'Bilinmeyen Satıcı',
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// 2. POST /competitors/sync - Manuel Bot Çalıştırma
// ==========================================
export async function syncCompetitorPrices() {
  // Aktif tüm rakiplerin fiyatlarını simüle ederek güncelle
  const { data: competitors, error: fetchError } = await supabase
    .from('competitors')
    .select('*')
    .eq('is_active', true)

  if (fetchError) throw fetchError

  for (const comp of competitors) {
    // Fiyatı %1-3 arası rastgele değiştir (simülasyon)
    const change = (Math.random() - 0.5) * 0.04
    const currentPrice = Number(comp.last_price) || 100
    const newPrice = Math.round(currentPrice * (1 + change) * 100) / 100

    // Rakip fiyatını güncelle
    await supabase
      .from('competitors')
      .update({ last_price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', comp.id)

    // Fiyat geçmişine kaydet
    await supabase.from('price_history').insert({
      competitor_id: comp.id,
      price: newPrice,
    })
  }

  return { message: 'Senkronizasyon tamamlandı', count: competitors.length }
}

// ==========================================
// 3. GET /products/{productId}/competitors - Rakip Listesi
// ==========================================
export async function getCompetitorsByProduct(productId) {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ==========================================
// 4. GET /competitors/{competitorId}/history - Fiyat Geçmişi
// ==========================================
export async function getCompetitorHistory(competitorId) {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('recorded_at', { ascending: true })

  if (error) throw error
  return data
}

// ==========================================
// 5. PUT /competitors/{competitorId}/status - Durum Güncelle
// ==========================================
export async function updateCompetitorStatus(competitorId, isActive) {
  const { data, error } = await supabase
    .from('competitors')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', competitorId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// 6. DELETE /competitors/{competitorId} - Rakip Silme
// ==========================================
export async function deleteCompetitor(competitorId) {
  const { error } = await supabase
    .from('competitors')
    .delete()
    .eq('id', competitorId)

  if (error) throw error
}

// ==========================================
// Yardımcı: Ürün Listesi
// ==========================================
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}
