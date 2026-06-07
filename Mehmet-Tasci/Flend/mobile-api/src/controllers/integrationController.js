// ============================================
// Entegrasyon Controller (Mobil Backend)
// Görev 1 & 5: Pazaryeri entegrasyonu ekleme / güncelleme
// + Ürün senkronizasyonu artık MESAJ KUYRUĞUNA (Redis/BullMQ) atılır.
// ============================================

const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const { enqueueSync, getJobStatus } = require('../queue');

// GET /api/integrations - Mobil "bağlantı yenileme" ekranı için liste
const getAllIntegrations = async (req, res, next) => {
  try {
    const { data, error, count } = await supabase
      .from('integrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 400);
    res.json({ success: true, data, count });
  } catch (err) {
    next(err);
  }
};

// POST /api/integrations - Görev 1: Entegrasyon ekleme
const createIntegration = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { marketplace_name, api_key, api_secret, base_url } = body;

    // Validasyon - mobil istemci 400 yakalar
    if (!marketplace_name || !api_key) {
      throw new AppError('Pazaryeri adı ve API Key zorunludur', 400);
    }

    let final_base_url = base_url;
    const mp_lower = marketplace_name.toLowerCase();
    if (!final_base_url) {
      if (mp_lower.includes('trendyol')) final_base_url = 'https://api.trendyol.com/sapigw';
      else if (mp_lower.includes('hepsiburada')) final_base_url = 'https://mpop.hepsiburada.com/api';
      else final_base_url = 'https://lxpeswjgbcotmsxxuxzc.supabase.co/rest/v1';
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        marketplace_name,
        api_key,
        api_secret: api_secret || null,
        base_url: final_base_url,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/integrations/:id - Görev 5: Token / API bilgisi güncelleme
const updateIntegration = async (req, res, next) => {
  try {
    const cleanId = req.params.id.trim();

    const { error } = await supabase
      .from('integrations')
      .update(req.body)
      .eq('id', cleanId);
    if (error) throw new AppError(error.message, 400);

    const { data: checkData, error: getError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', cleanId);
    if (getError) throw new AppError(getError.message, 400);

    if (!checkData || checkData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Entegrasyon bulunamadı' });
    }

    res.json({ success: true, data: checkData[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/integrations/:id - Entegrasyonu (ve ona ait ürünleri) sil
const deleteIntegration = async (req, res, next) => {
  try {
    const cleanId = req.params.id.trim();

    // Önce bu entegrasyona ait ürünleri temizle (varsa)
    await supabase.from('products').delete().eq('integration_id', cleanId);

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', cleanId);
    if (error) throw new AppError(error.message, 400);

    res.json({ success: true, message: 'Entegrasyon silindi' });
  } catch (err) {
    next(err);
  }
};

// POST /api/integrations/:id/sync
// ESKİ: performSync'i burada bekletiyorduk (uzun sürer, isteği bloklar).
// YENİ: "senkronize et" mesajını kuyruğa atıp 202 ile hemen cevap dönüyoruz.
// Asıl iş worker tarafından arka planda yapılır.
const syncProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = await enqueueSync(id);
    res.status(202).json({
      success: true,
      message: 'Senkronizasyon kuyruğa alındı, arka planda işleniyor',
      jobId,
      status: 'queued',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/integrations/sync/jobs/:jobId
// Mobil uygulama, kuyruğa atılan işin durumunu buradan sorgular (poll).
const getSyncStatus = async (req, res, next) => {
  try {
    const status = await getJobStatus(req.params.jobId);
    if (!status) {
      return res.status(404).json({ success: false, message: 'İş bulunamadı' });
    }
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  syncProducts,
  getSyncStatus,
};
