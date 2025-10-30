const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All settings routes require admin authentication
router.use(authenticateToken);

// Get system settings
router.get('/', getSettings);

// Update system settings (admin only)
router.put('/', requireAdmin, updateSettings);

module.exports = router;
