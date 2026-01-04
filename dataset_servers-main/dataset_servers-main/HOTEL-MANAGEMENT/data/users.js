const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create mock users
const users = [
  new User(
    uuidv4(),
    'John Doe',
    'john@example.com',
    bcrypt.hashSync('password123', 10),
    '555-123-4567'
  ),
  new User(
    uuidv4(),
    'Jane Smith',
    'jane@example.com',
    bcrypt.hashSync('password123', 10),
    '555-987-6543'
  ),
  new User(
    uuidv4(),
    'Admin User',
    'admin@hotel.com',
    bcrypt.hashSync('admin123', 10),
    '555-111-0000'
  )
];

module.exports = users; 