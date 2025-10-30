const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { generateId, formatUser } = require('../utils/helpers');
require('dotenv').config();

// Login
const login = async (req, res) => {
  try {
    console.log('🔵 Login attempt received');
    const { username, password } = req.body;
    console.log('🔵 Username:', username);
    console.log('🔵 Password provided:', password ? 'Yes (length: ' + password.length + ')' : 'No');

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    console.log('🔵 Querying database for user:', username);
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('🔵 Users found:', users.length);

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    console.log('🔵 User found:', { id: user.id, username: user.username, role: user.role });
    console.log('🔵 Password hash from DB starts with:', user.password?.substring(0, 20) + '...');

    // Verify password
    console.log('🔵 Comparing password with bcrypt...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔵 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password does not match');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('✓ Authentication successful');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('✓ Token generated successfully');
    res.json({
      token,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: formatUser(users[0]) });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update username
const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if username already exists
    const existingUsers = await query('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.user.id]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update username
    await query('UPDATE users SET username = ? WHERE id = ?', [username, req.user.id]);

    // Get updated user
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);

    res.json({ user: formatUser(users[0]) });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  getCurrentUser,
  updateUsername,
  updatePassword
};
