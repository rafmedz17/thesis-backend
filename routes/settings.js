const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get system settings (PUBLIC - no authentication required)
// This allows public visitors to see school name, logo, and colors
router.get('/', getSettings);

// Update system settings (requires authentication)
router.put('/', authenticateToken, updateSettings);

module.exports = router;
