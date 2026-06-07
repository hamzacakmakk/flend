// ============================================
// Mobil backend ile iletişim katmanı
// Görev: Bearer Token ile çağrı, 400/401 hata yakalama
// ============================================

import axios from 'axios';
import { API_BASE_URL, MOBILE_API_TOKEN } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MOBILE_API_TOKEN}`,
  },
});

// Hata mesajını mobil arayüzde gösterilebilir hâle getir
function normalizeError(err) {
  if (err.response) {
    const { status, data } = err.response;
    return {
      status,
      message:
        data?.message ||
        (status === 401
          ? 'Yetkilendirme hatası (401)'
          : status === 400
          ? 'Geçersiz istek (400)'
          : `Sunucu hatası (${status})`),
    };
  }
  return {
    status: 0,
    message:
      'Sunucuya ulaşılamadı. API adresini (src/config.js) ve backend\'in çalıştığını kontrol edin.',
  };
}

// ---- Entegrasyon servisleri ----
export const integrationAPI = {
  // Görev 5 (ekran): bağlantı listesi
  getAll: () => api.get('/integrations'),
  // Görev 1: entegrasyon ekleme
  create: (data) => api.post('/integrations', data),
  // Görev 5: token / API bilgisi güncelleme
  update: (id, data) => api.put(`/integrations/${id}`, data),
  // Entegrasyonu sil (ona ait ürünlerle birlikte)
  remove: (id) => api.delete(`/integrations/${id}`),
  // Ürün senkronizasyonunu KUYRUĞA at (202 + jobId döner, beklemez)
  sync: (id) => api.post(`/integrations/${id}/sync`),
  // Kuyruğa atılan işin durumunu sorgula (poll)
  syncStatus: (jobId) => api.get(`/integrations/sync/jobs/${jobId}`),
};

// Kuyruğa atılan senkronizasyon işini, bitene kadar durumunu sorgulayarak bekler.
// onProgress(data) ile {state, progress, count} bilgisi UI'a aktarılabilir.
export async function waitForSync(
  jobId,
  { onProgress, intervalMs = 1200, timeoutMs = 60000 } = {}
) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await integrationAPI.syncStatus(jobId);
    const data = res.data?.data;
    if (onProgress && data) onProgress(data);
    if (data?.state === 'completed') return data;
    if (data?.state === 'failed') {
      throw new Error(data.failedReason || 'Senkronizasyon başarısız oldu');
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error('Senkronizasyon zaman aşımına uğradı');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

// ---- Envanter servisleri ----
export const inventoryAPI = {
  // Görev 2: sayfalı ürün listesi
  getProducts: (params) => api.get('/inventory/products', { params }),
  // Görev 3: tekil ürün detayı
  getProduct: (id) => api.get(`/inventory/products/${id}`),
  // Görev 4: minimum fiyat güncelleme
  updateMinPrice: (id, min_price) =>
    api.put(`/inventory/products/${id}/min-price`, { min_price }),
  // Görev 6: ürün silme / takipten çıkarma
  deleteProduct: (id) => api.delete(`/inventory/products/${id}`),
};

export { normalizeError };
export default api;
