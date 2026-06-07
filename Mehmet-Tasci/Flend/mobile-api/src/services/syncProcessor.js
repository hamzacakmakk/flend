// ============================================
// performSync - asıl ürün senkronizasyon işi
// ============================================
//
// Bu kod artık API isteğinin İÇİNDE değil, worker tarafından
// (kuyruktan mesaj geldikçe) ARKA PLANDA çalışır.
//
// Pazaryeri (Trendyol / Hepsiburada / vb.) API'sine gidip ürünleri
// çeker ve Supabase'deki products tablosuna upsert eder. Uzun sürebilir;
// bu yüzden kuyruğa alınır.

const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const axios = require('axios');

// onProgress(percent): worker iş ilerlemesini bildirmek için kullanır (opsiyonel).
async function performSync(id, onProgress = () => {}) {
  await onProgress(15);

  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !integration) throw new AppError('Entegrasyon bulunamadı', 404);

  const baseUrl =
    integration.base_url || 'https://lxpeswjgbcotmsxxuxzc.supabase.co/rest/v1';
  let finalUrl = `${baseUrl}/products`;
  let headers = {
    'User-Agent': 'Flend-Mobile/1.0',
    Accept: 'application/json',
  };

  let mappingFn = (p) => ({
    integration_id: id,
    marketplace_product_id: String(p.id || p.barcode || p.sku || crypto.randomUUID()),
    title: p.name || p.title || p.productName || 'İsimsiz Ürün',
    barcode: p.barcode || '',
    sale_price: parseFloat(p.price || p.salePrice || p.listPrice || 0),
    stock_quantity: parseInt(p.stock || p.quantity || p.stockQuantity || 0),
    currency: p.currency || 'TRY',
    is_active: true,
  });

  const marketplace = integration.marketplace_name?.toLowerCase() || 'default';

  switch (true) {
    case marketplace.includes('trendyol'): {
      const parts = integration.api_key.split(':');
      const supplierId = parts.length > 1 ? parts[0] : integration.api_key;
      const actualApiKey = parts.length > 1 ? parts[1] : integration.api_key;
      finalUrl = `${baseUrl}/suppliers/${supplierId}/products`;
      headers['Authorization'] = `Basic ${Buffer.from(
        `${actualApiKey}:${integration.api_secret || ''}`
      ).toString('base64')}`;
      mappingFn = (p) => ({
        integration_id: id,
        marketplace_product_id: String(p.barcode || crypto.randomUUID()),
        title: p.title || 'Trendyol Ürünü',
        barcode: p.barcode || '',
        sale_price: parseFloat(p.salePrice || 0),
        stock_quantity: parseInt(p.quantity || 0),
        currency: p.currencyType || 'TRY',
        is_active: true,
      });
      break;
    }
    case marketplace.includes('hepsiburada'):
      headers['Authorization'] = `Basic ${Buffer.from(
        `${integration.api_key}:${integration.api_secret || ''}`
      ).toString('base64')}`;
      headers['x-api-key'] = integration.api_key;
      mappingFn = (p) => ({
        integration_id: id,
        marketplace_product_id: String(p.sku || crypto.randomUUID()),
        title: p.name || 'Hepsiburada Ürünü',
        barcode: p.barcode || '',
        sale_price: parseFloat(p.price || 0),
        stock_quantity: parseInt(p.stock || 0),
        currency: 'TRY',
        is_active: true,
      });
      break;
    default:
      if (baseUrl.includes('supabase.co')) {
        headers['apikey'] = integration.api_key;
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      } else if (integration.api_secret && integration.api_secret.length > 2) {
        headers['Authorization'] = `Basic ${Buffer.from(
          `${integration.api_key}:${integration.api_secret}`
        ).toString('base64')}`;
      } else if (integration.api_key) {
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      }
      break;
  }

  await onProgress(45);

  try {
    const response = await axios.get(finalUrl, { headers });
    const responseData = response.data;
    let items = Array.isArray(responseData)
      ? responseData
      : responseData.items ||
        responseData.content ||
        responseData.data ||
        responseData.products ||
        responseData.results ||
        [];

    await onProgress(70);

    if (items.length === 0) return 0;

    const productsToUpsert = items.map(mappingFn);
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'marketplace_product_id' });
    if (upsertError) throw new AppError(upsertError.message, 400);

    await onProgress(95);
    return productsToUpsert.length;
  } catch (apiError) {
    if (apiError instanceof AppError) throw apiError;
    const status = apiError.response?.status;
    if (status === 401 || status === 403) {
      throw new AppError('API Anahtarı Hatalı', status);
    }
    throw new AppError(
      `API İsteği başarısız oldu: ${apiError.message}`,
      status || 400
    );
  }
}

module.exports = { performSync };
