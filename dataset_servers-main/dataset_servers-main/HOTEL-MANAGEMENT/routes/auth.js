const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const User = require('../models/User');
const users = require('../data/users');
const { generateToken } = require('../utils/jwt');

// Store active tokens for logout functionality
const activeTokens = new Set();

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check for existing user
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create and store new user
  const newUser = new User(
    uuidv4(),
    name,
    email,
    bcrypt.hashSync(password, 10)
  );
  
  users.push(newUser);

  // Generate token
  const token = generateToken(newUser);
  activeTokens.add(token);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: newUser.toJSON()
  });
});

// @route   POST /auth/login
// @desc    Login a user and get token
// @access  Public
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Find user
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Validate password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

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
// @desc    Logout a user and invalidate token
// @access  Private
router.post('/logout', (req, res) => {
  const token = req.header('x-auth-token');
  
  if (token && activeTokens.has(token)) {
    activeTokens.delete(token);
    return res.json({ message: 'Logout successful' });
  }
  
  res.status(400).json({ message: 'Invalid token' });
});

module.exports = router; 