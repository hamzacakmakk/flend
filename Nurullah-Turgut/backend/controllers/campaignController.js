exports.getSuggestions = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id gerekli' });
    }

    // Örnek veri döküyoruz
    const suggestions = [
      { id: 1, type: 'Stok Eritme', product: 'Laptop Standı', advice: 'Fiyatı %10 indir' },
      { id: 2, type: 'Kampanya', product: 'Gaming Mouse', advice: '2 al 1 öde yap' }
    ];

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};