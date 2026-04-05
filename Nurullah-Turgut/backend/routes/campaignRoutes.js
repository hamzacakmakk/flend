const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/campaignController');

// Sonuç: /api/analytics + /suggestions
router.get('/suggestions', getSuggestions);

module.exports = router;