// ============================================
// Product Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  updateMinPrice,
  deleteProduct,
} = require('../controllers/productController');

router.get('/', getAllProducts);

router.get('/:id', getProductById);
router.put('/:id/min-price', updateMinPrice);
router.delete('/:id', deleteProduct);

module.exports = router;
