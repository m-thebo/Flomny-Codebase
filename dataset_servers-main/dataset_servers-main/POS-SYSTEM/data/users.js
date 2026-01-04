const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create mock users
const users = [
  new User(
    uuidv4(),
    'admin',
    bcrypt.hashSync('admin123', 10),
    'admin',
    'System Administrator'
  ),
  new User(
    uuidv4(),
    'cashier1',
    bcrypt.hashSync('cashier123', 10),
    'cashier',
    'Jane Smith'
  ),
  new User(
    uuidv4(),
    'cashier2',
    bcrypt.hashSync('cashier123', 10),
    'cashier',
    'John Doe'
  )
];

module.exports = users; 