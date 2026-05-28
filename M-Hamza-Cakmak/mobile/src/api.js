import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

export async function getCompetitors(productId) {
  const response = await fetch(`${API_URL}/products/${productId}/competitors`);
  if (!response.ok) throw new Error('Rakipler getirilemedi');
  return response.json();
}

export async function syncPrices() {
  const response = await fetch(`${API_URL}/competitors/sync`, { method: 'POST' });
  if (!response.ok) throw new Error('Senkronizasyon başarısız');
  return response.json();
}

export async function updateStatus(competitorId, isActive) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  if (!response.ok) throw new Error('Durum güncellenemedi');
  return response.json();
}

export async function deleteCompetitor(competitorId) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Rakip silinemedi');
}

export async function getHistory(competitorId) {
  const response = await fetch(`${API_URL}/competitors/${competitorId}/history`);
  if (!response.ok) throw new Error('Fiyat geçmişi getirilemedi');
  return response.json();
}
