const express = require('express');
const router = express.Router();
const multer = require('multer');
const thesisController = require('../controllers/thesisController');
const { authenticateToken, requireAdminOrAssistant } = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage, // Using Cloudinary storage from config
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Public routes (read-only)
router.get('/', thesisController.getTheses);
router.get('/years/unique', thesisController.getUniqueYears);
router.get('/:id', thesisController.getThesis);

// Protected routes (admin and student assistant)
router.post('/', authenticateToken, requireAdminOrAssistant, upload.single('pdf'), thesisController.createThesis);
router.put('/:id', authenticateToken, requireAdminOrAssistant, upload.single('pdf'), thesisController.updateThesis);
router.delete('/:id', authenticateToken, requireAdminOrAssistant, thesisController.deleteThesis);

module.exports = router;
