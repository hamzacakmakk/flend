// ============================================
// Envanter rotaları (Mobil Backend) - öneki /api/inventory
// ============================================

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  updateMinPrice,
  deleteProduct,
} = require('../controllers/inventoryController');

router.get('/products', getProducts);
router.get('/products/:productId', getProductById);
router.put('/products/:productId/min-price', updateMinPrice);
router.delete('/products/:productId', deleteProduct);

module.exports = router;
