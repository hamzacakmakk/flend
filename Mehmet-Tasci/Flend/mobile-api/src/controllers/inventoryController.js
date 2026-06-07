// ============================================
// Envanter Controller (Mobil Backend)
// Görev 2,3,4,6: Ürün listesi / detay / min fiyat / silme
// Endpoint öneki: /api/inventory/products
// ============================================

const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

// GET /api/inventory/products - Görev 2: Sayfalı ürün listesi
const getProducts = async (req, res, next) => {
  try {
    const { integration_id, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, integrations(marketplace_name)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (integration_id) query = query.eq('integration_id', integration_id);
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,barcode.ilike.%${search}%,marketplace_product_id.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: offset + limit < (count || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/products/:productId - Görev 3: Tekil ürün detayı
const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*, integrations(marketplace_name)')
      .eq('id', productId)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError('Ürün bulunamadı', 404);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/products/:productId/min-price - Görev 4: Min fiyat güncelle
const updateMinPrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
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
      .eq('id', productId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError('Ürün bulunamadı', 404);

    res.json({
      success: true,
      message: 'Minimum satış fiyatı güncellendi',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/inventory/products/:productId - Görev 6: Takipten çıkar (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
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
  getProducts,
  getProductById,
  updateMinPrice,
  deleteProduct,
};
