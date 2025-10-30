const { query } = require('../config/database');
const { generateId } = require('../utils/helpers');

// Get all programs
const getPrograms = async (req, res) => {
  try {
    const { department } = req.query;

    let queryStr = 'SELECT * FROM programs';
    const params = [];

    if (department) {
      queryStr += ' WHERE department = ?';
      params.push(department);
    }

    queryStr += ' ORDER BY department, name';

    const programs = await query(queryStr, params);

    // Convert MySQL BOOLEAN (TINYINT) to JavaScript boolean
    const formattedPrograms = programs.map(program => ({
      ...program,
      isActive: !!program.isActive
    }));

    res.json(formattedPrograms);
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single program
const getProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const programs = await query('SELECT * FROM programs WHERE id = ?', [id]);

    if (programs.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const program = programs[0];
    program.isActive = !!program.isActive;

    res.json(program);
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create program
const createProgram = async (req, res) => {
  try {
    const { name, department, description, isActive } = req.body;

    // Validation
    if (!name || !department) {
      return res.status(400).json({ error: 'Name and department are required' });
    }

    if (!['college', 'senior-high'].includes(department)) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    // Generate ID
    const id = generateId();

    // Insert program
    await query(
      'INSERT INTO programs (id, name, department, description, isActive) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        name,
        department,
        description || null,
        isActive !== undefined ? isActive : true
      ]
    );

    // Get created program
    const newProgram = await query('SELECT * FROM programs WHERE id = ?', [id]);
    const program = newProgram[0];
    program.isActive = !!program.isActive;

    res.status(201).json(program);
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update program
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, description, isActive } = req.body;

    // Check if program exists
    const existingPrograms = await query('SELECT * FROM programs WHERE id = ?', [id]);

    if (existingPrograms.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (department !== undefined) {
      if (!['college', 'senior-high'].includes(department)) {
        return res.status(400).json({ error: 'Invalid department' });
      }
      updates.push('department = ?');
      values.push(department);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }
    if (isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await query(
      `UPDATE programs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated program
    const updatedProgram = await query('SELECT * FROM programs WHERE id = ?', [id]);
    const program = updatedProgram[0];
    program.isActive = !!program.isActive;

    res.json(program);
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete program
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const existingPrograms = await query('SELECT * FROM programs WHERE id = ?', [id]);

    if (existingPrograms.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    await query('DELETE FROM programs WHERE id = ?', [id]);

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
};
