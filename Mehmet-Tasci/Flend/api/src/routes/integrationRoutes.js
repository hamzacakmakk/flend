// ============================================
// Integration Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAllIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  syncProducts,
} = require('../controllers/integrationController');

router.get('/', getAllIntegrations);
router.post('/', createIntegration);
router.put('/:id', updateIntegration);
router.delete('/:id', deleteIntegration);
router.post('/:id/sync', syncProducts);

module.exports = router;
