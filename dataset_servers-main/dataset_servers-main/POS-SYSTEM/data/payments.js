const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const sales = require('./sales');
const users = require('./users');

const cashierId = users.find(user => user.role === 'cashier').id;

// Create mock payments for completed sales
const payments = [
  new Payment(
    uuidv4(),
    sales[0].id,
    sales[0].total,
    'credit_card',
    cashierId
  ),
  new Payment(
    uuidv4(),
    sales[1].id,
    sales[1].total,
    'cash',
    cashierId
  )
];

// Set payment ID in sales
sales[0].paymentId = payments[0].id;
sales[1].paymentId = payments[1].id;

// Calculate change for cash payment
payments[1].calculateChange(100); // Assuming customer gave $100

module.exports = payments; 