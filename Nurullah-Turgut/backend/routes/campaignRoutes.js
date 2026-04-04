const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/campaignController');

// GET /api/campaigns/suggestions
router.get('/suggestions', getSuggestions);

module.exports = router;
