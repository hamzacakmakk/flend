const express = require('express');
const router = express.Router();
const { getAll, markAsRead, deleteNotification } = require('../controllers/notificationController');

// GET /api/notifications
router.get('/', getAll);

// PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

module.exports = router;
