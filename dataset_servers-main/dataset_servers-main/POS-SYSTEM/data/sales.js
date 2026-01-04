const { v4: uuidv4 } = require('uuid');
const Sale = require('../models/Sale');
const products = require('./products');
const users = require('./users');
const customers = require('./customers');

// Helper to find product by index for creating sample sales
const getProduct = (index) => products[index % products.length];
const cashierId = users.find(user => user.role === 'cashier').id;

// Create mock sales
const sales = [
  new Sale(
    uuidv4(),
    [
      {
        productId: getProduct(0).id,
        name: getProduct(0).name,
        quantity: 2,
        price: getProduct(0).price,
        subtotal: getProduct(0).price * 2
      },
      {
        productId: getProduct(3).id,
        name: getProduct(3).name,
        quantity: 1,
        price: getProduct(3).price,
        subtotal: getProduct(3).price * 1
      }
    ],
    cashierId,
    customers[0].id
  ),
  new Sale(
    uuidv4(),
    [
      {
        productId: getProduct(1).id,
        name: getProduct(1).name,
        quantity: 1,
        price: getProduct(1).price,
        subtotal: getProduct(1).price * 1
      },
      {
        productId: getProduct(6).id,
        name: getProduct(6).name,
        quantity: 3,
        price: getProduct(6).price,
        subtotal: getProduct(6).price * 3
      }
    ],
    cashierId,
    customers[1].id
  ),
  new Sale(
    uuidv4(),
    [
      {
        productId: getProduct(2).id,
        name: getProduct(2).name,
        quantity: 1,
        price: getProduct(2).price,
        subtotal: getProduct(2).price * 1
      }
    ],
    cashierId,
    customers[2].id
  )
];

// Mark first two sales as completed
sales[0].status = 'completed';
sales[0].paymentStatus = 'paid';
sales[0].paymentId = uuidv4();

sales[1].status = 'completed';
sales[1].paymentStatus = 'paid';
sales[1].paymentId = uuidv4();

module.exports = sales; 