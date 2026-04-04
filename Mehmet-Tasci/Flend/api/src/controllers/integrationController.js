const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// 1. Tüm Entegrasyonları Getir
const getAllIntegrations = async (req, res, next) => {
  try {
    const { data, error, count } = await supabase
      .from('integrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 400);
    res.json({ success: true, data, count });
  } catch (err) { next(err); }
};

// 2. Yeni Entegrasyon Oluştur (DÜZELTİLDİ: Artık base_url boş kalmaz)
const createIntegration = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { marketplace_name, api_key, api_secret, base_url } = body;
    if (!marketplace_name || !api_key) throw new AppError('Pazaryeri adı ve API Key zorunludur', 400);

    // Otomatik URL belirleme veya gelen URL'yi kullanma
    let final_base_url = base_url;
    const mp_lower = marketplace_name.toLowerCase();

    if (!final_base_url) {
      if (mp_lower.includes('trendyol')) final_base_url = 'https://api.trendyol.com/sapigw';
      else if (mp_lower.includes('hepsiburada')) final_base_url = 'https://mpop.hepsiburada.com/api';
      else {
        // Test için senin Supabase adresini varsayılan yapıyoruz
        final_base_url = 'https://fljiqevuufrghptzmubw.supabase.co/rest/v1';
      }
    }

    const { data, error } = await supabase.from('integrations').insert({
      marketplace_name,
      api_key,
      api_secret: api_secret || null,
      base_url: final_base_url,
      status: 'active'
    }).select().single();

    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

// 3. Ortak Sync Fonksiyonu (DÜZELTİLDİ: Strategy Pattern Entegrasyonu)
const performSync = async (id) => {
  const { data: integration, error } = await supabase.from('integrations').select('*').eq('id', id).single();
  if (error || !integration) throw new AppError('Entegrasyon bulunamadı', 404);

  // Varsayılan ayarlamalar
  const baseUrl = integration.base_url || 'https://fljiqevuufrghptzmubw.supabase.co/rest/v1';
  let finalUrl = `${baseUrl}/products`;
  let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json'
  };

  // Varsayılan veri eşleme (mapping) fonksiyonu
  let mappingFn = (p) => ({
    integration_id: id,
    marketplace_product_id: String(p.id || p.barcode || p.sku || uuidv4()),
    title: p.name || p.title || p.productName || 'İsimsiz Ürün',
    barcode: p.barcode || '',
    sale_price: parseFloat(p.price || p.salePrice || p.listPrice || 0),
    stock_quantity: parseInt(p.stock || p.quantity || p.stockQuantity || 0),
    currency: p.currency || 'TRY',
    is_active: true
  });

  const marketplace = integration.marketplace_name?.toLowerCase() || 'default';

  // Strategy Pattern (Dinamik Konfigürasyon Bloğu)
  switch (true) {
    case marketplace.includes('trendyol'):
      // Trendyol requires both Supplier ID (in URL) and API Key (in Auth). 
      // User can input 'SupplierId:ApiKey' in the API Key field.
      const parts = integration.api_key.split(':');
      const supplierId = parts.length > 1 ? parts[0] : integration.api_key;
      const actualApiKey = parts.length > 1 ? parts[1] : integration.api_key;

      finalUrl = `${baseUrl}/suppliers/${supplierId}/products`;
      headers['Authorization'] = `Basic ${Buffer.from(`${actualApiKey}:${integration.api_secret || ''}`).toString('base64')}`;
      mappingFn = (p) => ({
        integration_id: id,
        marketplace_product_id: String(p.barcode || uuidv4()),
        title: p.title || 'Trendyol Ürünü',
        barcode: p.barcode || '',
        sale_price: parseFloat(p.salePrice || 0),
        stock_quantity: parseInt(p.quantity || 0),
        currency: p.currencyType || 'TRY',
        is_active: true
      });
      break;

    case marketplace.includes('hepsiburada'):
      headers['Authorization'] = `Basic ${Buffer.from(`${integration.api_key}:${integration.api_secret || ''}`).toString('base64')}`;
      headers['x-api-key'] = integration.api_key;
      mappingFn = (p) => ({
        integration_id: id,
        marketplace_product_id: String(p.sku || uuidv4()),
        title: p.name || 'Hepsiburada Ürünü',
        barcode: p.barcode || '',
        sale_price: parseFloat(p.price || 0),
        stock_quantity: parseInt(p.stock || 0),
        currency: 'TRY', // Hepsiburada varsayılan döviz birimi genelde TR'dir
        is_active: true
      });
      break;

    // Yeni Pazaryeri Eklemek Çok Kolay:
    // case marketplace.includes('amazon'):
    //   finalUrl = `...`
    //   headers['...'] = `...`
    //   mappingFn = (p) => ({ ... })
    //   break;

    default:
      // Supabase / Test / Diğer (Varsayılan Davranış)
      if (baseUrl.includes('supabase.co')) {
        headers['apikey'] = integration.api_key;
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      } else if (integration.api_secret && integration.api_secret.length > 2) {
        headers['Authorization'] = `Basic ${Buffer.from(`${integration.api_key}:${integration.api_secret}`).toString('base64')}`;
      } else if (integration.api_key) {
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      }
      break;
  }

  console.log("🚀 İstek atılan adres:", finalUrl);

  try {
    const response = await axios.get(finalUrl, { headers });
    const responseData = response.data;

    // JSON Objesinden Ürün Dizi'sini Çıkar
    let items = Array.isArray(responseData) ? responseData :
      (responseData.items || responseData.content || responseData.data || []);

    if (items.length === 0) return 0;

    // Stratejiye Ait Mapping Fonksiyonunu Çalıştır
    const productsToUpsert = items.map(mappingFn);

    const { error: upsertError } = await supabase.from('products').upsert(productsToUpsert, { onConflict: 'marketplace_product_id' });
    if (upsertError) throw new AppError(upsertError.message, 400);

    return productsToUpsert.length;
  } catch (apiError) {
    const status = apiError.response?.status;

    // Hata Yakalama (Özelleştirilmiş 401/403 yönetimi)
    if (status === 401 || status === 403) {
      throw new AppError('API Anahtarı Hatalı', status);
    }

    console.error("❌ API HATASI:", apiError.response?.data || apiError.message);
    throw new AppError(`API İsteği başarısız oldu: ${apiError.message}`, status || 400);
  }
};

// 4. Diğer Handler'lar
const syncProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const count = await performSync(id);
    res.json({ success: true, message: 'Senkronizasyon başarılı!', count });
  } catch (err) { next(err); }
};

const updateIntegration = async (req, res, next) => {
  try {
    const cleanId = req.params.id.trim();

    // 1. ADIM: Sadece güncelle, Supabase'den hiçbir şey dönmesini bekleme (.single veya .select YOK)
    const { error } = await supabase
      .from('integrations')
      .update(req.body)
      .eq('id', cleanId);

    if (error) throw new AppError(error.message, 400);

    // 2. ADIM: Acaba güncellendi mi? Gidip güncellenmiş veriyi liste olarak kendimiz çekelim
    const { data: checkData, error: getError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', cleanId);

    if (getError) throw new AppError(getError.message, 400);

    // 3. ADIM: Liste boş döndüyse (yani veritabanında bu ID cidden yoksa) çökme, cevap dön
    if (!checkData || checkData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu ID veritabanında yok kardeşim."
      });
    }

    // Her şey tamamsa listenin ilk elemanını (güncellenmiş veriyi) dön
    res.json({ success: true, data: checkData[0] });
  } catch (err) {
    next(err);
  }
};

const deleteIntegration = async (req, res, next) => {
  try {
    await supabase.from('products').delete().eq('integration_id', req.params.id);
    const { error } = await supabase.from('integrations').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 400);
    res.json({ success: true, message: 'Silindi' });
  } catch (err) { next(err); }
};

module.exports = { getAllIntegrations, createIntegration, updateIntegration, deleteIntegration, syncProducts };