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

// Authenticated routes (accessible to all authenticated users)
router.use(authenticateToken);

// Create program
router.post('/', createProgram);

// Update program
router.put('/:id', updateProgram);

// Delete program
router.delete('/:id', deleteProgram);

module.exports = router;
