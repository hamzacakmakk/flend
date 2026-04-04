const supabase = require('../config/supabase');

// GET /api/dashboard/stats
// Dashboard ana sayfası için özet istatistikleri getirir
const getStats = async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEMO_USER_ID;

    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    // DOSYADAKİ BU KISMI GÜNCELLE:
    res.status(200).json({
      success: true,
      data: {
        buybox_rate: data.buybox_rate,              // win_rate değil, rate
        total_tracked_products: data.total_tracked_products, // count değil, total_tracked_products
        total_sales: data.total_sales,              // Yeni ekleyeceğiz
        active_campaigns: data.active_campaigns,    // Yeni ekleyeceğiz
        recorded_at: data.recorded_at,
      },
    });
  } catch (error) {
    console.error('Dashboard stats hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Dashboard istatistikleri getirilemedi.',
      details: error.message,
    });
  }
};

module.exports = { getStats };
