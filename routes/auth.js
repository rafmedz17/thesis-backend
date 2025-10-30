const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/username', authenticateToken, authController.updateUsername);
router.put('/password', authenticateToken, authController.updatePassword);

module.exports = router;
