// ============================================
// Entegrasyon rotaları (Mobil Backend)
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAllIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  syncProducts,
  getSyncStatus,
} = require('../controllers/integrationController');

router.get('/', getAllIntegrations);
router.post('/', createIntegration);

// Kuyruk işinin durum sorgusu (/:id'den ÖNCE tanımlı olmalı)
router.get('/sync/jobs/:jobId', getSyncStatus);

router.put('/:id', updateIntegration);
router.delete('/:id', deleteIntegration);
router.post('/:id/sync', syncProducts);

module.exports = router;
