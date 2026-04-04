const express = require('express');
const router = express.Router();
const { createRule, getRules } = require('../controllers/alertController');

// POST /api/alerts/rules
router.post('/rules', createRule);

// GET /api/alerts/rules (bonus)
router.get('/rules', getRules);

module.exports = router;
