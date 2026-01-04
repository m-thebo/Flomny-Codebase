const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const users = require('../data/users');

// Store active tokens for logout functionality
const activeTokens = new Set();

// @route   POST /auth/login
// @desc    Login a user (admin or cashier) and generate JWT token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Find user
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Validate password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate token
  const token = generateToken(user);
  activeTokens.add(token);

  res.json({
    message: 'Login successful',
    token,
    user: user.toJSON()
  });
});

// @route   POST /auth/logout
// @desc    Logout the user and invalidate JWT token
// @access  Private
router.post('/logout', auth, (req, res) => {
  const token = req.header('x-auth-token');
  
  if (token && activeTokens.has(token)) {
    activeTokens.delete(token);
    return res.json({ message: 'Logout successful' });
  }
  
  res.status(400).json({ message: 'Invalid token' });
});

module.exports = router; 