const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
} = require('../controllers/programsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all programs (public access for filtering thesis)
router.get('/', getPrograms);

// Get single program (public access)
router.get('/:id', getProgram);

// Admin-only routes
router.use(authenticateToken);
router.use(requireAdmin);

// Create program
router.post('/', createProgram);

// Update program
router.put('/:id', updateProgram);

// Delete program
router.delete('/:id', deleteProgram);

module.exports = router;
