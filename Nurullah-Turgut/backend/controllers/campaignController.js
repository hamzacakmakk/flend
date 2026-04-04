const supabase = require('../config/supabase');

// GET /api/campaigns/suggestions
// Satış hızına bağlı üretilen kampanya önerilerini listeler
const getSuggestions = async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEMO_USER_ID;

    const { data, error } = await supabase
      .from('campaign_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Öncelik sıralamasını düzenle (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = data.sort((a, b) =>
      (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    );

    res.status(200).json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  } catch (error) {
    console.error('Kampanya önerileri hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Kampanya önerileri getirilemedi.',
      details: error.message,
    });
  }
};

module.exports = { getSuggestions };
