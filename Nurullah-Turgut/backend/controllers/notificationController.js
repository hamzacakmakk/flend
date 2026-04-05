const supabase = require('../config/supabase');

// 1. Bildirimleri Listeleme
exports.getAll = async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = supabase.from('notifications').select('*');

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Bildirimi Okundu İşaretleme (O sorunlu .single() kısmını kaldırdık!)
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi.',
      data: data ? data[0] : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Bildirim Silme
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Bildirim başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};