const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateId, formatUser } = require('../utils/helpers');

// Get all student assistants
const getStudentAssistants = async (req, res) => {
  try {
    const assistants = await query(
      "SELECT * FROM users WHERE role = 'student-assistant' ORDER BY firstName, lastName"
    );

    res.json(assistants.map(formatUser));
  } catch (error) {
    console.error('Get student assistants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single student assistant
const getStudentAssistant = async (req, res) => {
  try {
    const { id } = req.params;

    const assistants = await query(
      "SELECT * FROM users WHERE id = ? AND role = 'student-assistant'",
      [id]
    );

    if (assistants.length === 0) {
      return res.status(404).json({ error: 'Student assistant not found' });
    }

    res.json(formatUser(assistants[0]));
  } catch (error) {
    console.error('Get student assistant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create student assistant
const createStudentAssistant = async (req, res) => {
  try {
    const { username, firstName, lastName, password } = req.body;

    // Validation
    if (!username || !firstName || !lastName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username already exists
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate ID
    const id = generateId();

    // Insert user
    await query(
      'INSERT INTO users (id, username, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username, hashedPassword, firstName, lastName, 'student-assistant']
    );

    // Get created user
    const newUser = await query('SELECT * FROM users WHERE id = ?', [id]);

    res.status(201).json(formatUser(newUser[0]));
  } catch (error) {
    console.error('Create student assistant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update student assistant
const updateStudentAssistant = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, password } = req.body;

    // Check if user exists
    const existingUsers = await query(
      "SELECT * FROM users WHERE id = ? AND role = 'student-assistant'",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Student assistant not found' });
    }

    // Check if username is taken by another user
    if (username) {
      const duplicateUsers = await query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );

      if (duplicateUsers.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (firstName) {
      updates.push('firstName = ?');
      values.push(firstName);
    }
    if (lastName) {
      updates.push('lastName = ?');
      values.push(lastName);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user
    const updatedUser = await query('SELECT * FROM users WHERE id = ?', [id]);

    res.json(formatUser(updatedUser[0]));
  } catch (error) {
    console.error('Update student assistant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete student assistant
const deleteStudentAssistant = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUsers = await query(
      "SELECT * FROM users WHERE id = ? AND role = 'student-assistant'",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Student assistant not found' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'Student assistant deleted successfully' });
  } catch (error) {
    console.error('Delete student assistant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStudentAssistants,
  getStudentAssistant,
  createStudentAssistant,
  updateStudentAssistant,
  deleteStudentAssistant
};
