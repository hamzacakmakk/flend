const supabase = require('../config/supabase');

// POST /api/alerts/rules
// Yeni alarm/bildirim kuralı oluşturur
const createRule = async (req, res) => {
  try {
    const userId = req.body.user_id || process.env.DEMO_USER_ID;
    const { rule_name, condition_type, threshold_value, threshold_unit, notify_via } = req.body;

    // Validasyon
    if (!rule_name || !condition_type || threshold_value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Eksik alanlar: rule_name, condition_type ve threshold_value zorunludur.',
      });
    }

    const validConditions = ['rakip_fiyat_dususu', 'stok_azalmasi', 'buybox_kaybi', 'fiyat_degisimi'];
    if (!validConditions.includes(condition_type)) {
      return res.status(400).json({
        success: false,
        error: `Geçersiz koşul tipi. Geçerli değerler: ${validConditions.join(', ')}`,
      });
    }

    const { data, error } = await supabase
      .from('alert_rules')
      .insert({
        user_id: userId,
        rule_name,
        condition_type,
        threshold_value: parseFloat(threshold_value),
        threshold_unit: threshold_unit || 'percent',
        notify_via: notify_via || 'in_app',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Alarm kuralı başarıyla oluşturuldu.',
      data,
    });
  } catch (error) {
    console.error('Alarm kuralı oluşturma hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Alarm kuralı oluşturulamadı.',
      details: error.message,
    });
  }
};

// GET /api/alerts/rules  (bonus: mevcut kuralları listeleme)
const getRules = async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEMO_USER_ID;

    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Alarm kuralları hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Alarm kuralları getirilemedi.',
      details: error.message,
    });
  }
};

module.exports = { createRule, getRules };
