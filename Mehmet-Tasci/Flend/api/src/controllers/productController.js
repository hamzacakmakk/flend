// ============================================
// Product Controller
// Envanter yönetimi CRUD işlemleri
// ============================================

const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

// GET /api/products - Tüm ürünleri listele
const getAllProducts = async (req, res, next) => {
  try {
    const { integration_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, integrations(marketplace_name)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (integration_id) {
      query = query.eq('integration_id', integration_id);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,barcode.ilike.%${search}%,marketplace_product_id.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id - Tekil ürün detayı
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*, integrations(marketplace_name)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError('Ürün bulunamadı', 404);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id/min-price - Minimum fiyat güncelle
const updateMinPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { min_price } = req.body;

    if (min_price === undefined || min_price === null) {
      throw new AppError('min_price zorunludur', 400);
    }

    if (typeof min_price !== 'number' || min_price < 0) {
      throw new AppError('min_price geçerli bir pozitif sayı olmalıdır', 400);
    }

    const { data, error } = await supabase
      .from('products')
      .update({ min_price })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError('Ürün bulunamadı', 404);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id - Ürünü envanterden kaldır (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError('Ürün bulunamadı', 404);

    res.json({ success: true, message: 'Ürün envanterden kaldırıldı' });
  } catch (err) {
    next(err);
  }
};




module.exports = {
  getAllProducts,
  getProductById,
  updateMinPrice,
  deleteProduct,
};

