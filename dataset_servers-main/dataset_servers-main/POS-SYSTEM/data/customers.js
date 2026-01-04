const { v4: uuidv4 } = require('uuid');
const Customer = require('../models/Customer');

// Create mock customers
const customers = [
  new Customer(
    uuidv4(),
    'Alice Johnson',
    'alice@example.com',
    '555-123-4567',
    '123 Main St, Anytown, USA'
  ),
  new Customer(
    uuidv4(),
    'Bob Smith',
    'bob@example.com',
    '555-987-6543',
    '456 Oak Ave, Somewhere, USA'
  ),
  new Customer(
    uuidv4(),
    'Carol Davis',
    'carol@example.com',
    '555-555-5555',
    '789 Pine Rd, Nowhere, USA'
  ),
  new Customer(
    uuidv4(),
    'David Wilson',
    'david@example.com',
    '555-222-3333',
    '321 Elm St, Anywhere, USA'
  ),
  new Customer(
    uuidv4(),
    'Eve Brown',
    'eve@example.com',
    '555-444-9999',
    '654 Maple Dr, Everywhere, USA'
  )
];

module.exports = customers; 