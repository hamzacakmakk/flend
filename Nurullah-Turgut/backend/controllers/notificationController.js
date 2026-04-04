const supabase = require('../config/supabase');

// GET /api/notifications
// Kullanıcıya ait bildirimleri tarihe göre sıralı listeler
const getAll = async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEMO_USER_ID;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const unreadCount = data.filter((n) => !n.is_read).length;

    res.status(200).json({
      success: true,
      count: data.length,
      unread_count: unreadCount,
      data,
    });
  } catch (error) {
    console.error('Bildirimler hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Bildirimler getirilemedi.',
      details: error.message,
    });
  }
};

// PUT /api/notifications/:id/read
// Bildirimi okundu olarak işaretler
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi.',
      data,
    });
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Bildirim güncellenemedi.',
      details: error.message,
    });
  }
};

// DELETE /api/notifications/:id
// Bildirimi siler
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bildirim başarıyla silindi.',
    });
  } catch (error) {
    console.error('Bildirim silme hatası:', error.message);
    res.status(500).json({
      success: false,
      error: 'Bildirim silinemedi.',
      details: error.message,
    });
  }
};

module.exports = { getAll, markAsRead, deleteNotification };
