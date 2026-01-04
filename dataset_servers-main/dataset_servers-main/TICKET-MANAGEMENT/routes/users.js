const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const users = require('../data/users');

// Basic Auth middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // In a real application, you would validate against a database
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.user = user;
  next();
};

// Admin level middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /users
router.get('/', basicAuth, adminAuth, (req, res) => {
  // Remove sensitive information before sending
  const sanitizedUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
  res.json(sanitizedUsers);
});

// GET /users/{userId}
router.get('/:userId', basicAuth, adminAuth, (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove sensitive information before sending
  const sanitizedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
  res.json(sanitizedUser);
});

module.exports = router; 