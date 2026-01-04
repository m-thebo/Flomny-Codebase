const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const payments = require('../data/payments');
const sales = require('../data/sales');
const customers = require('../data/customers');

// @route   GET /payments/:id
// @desc    Get payment details for a specific transaction
// @access  Private
router.get('/:id', auth, (req, res) => {
  const payment = payments.find(payment => payment.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  // Get related sale
  const sale = sales.find(sale => sale.id === payment.saleId);
  
  // Create response with sale summary
  const response = {
    ...payment,
    sale: sale ? {
      id: sale.id,
      date: sale.date,
      items: sale.items.length,
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      status: sale.status
    } : null
  };
  
  res.json(response);
});

// @route   POST /payments
// @desc    Process payment for a sale
// @access  Private
router.post('/', auth, (req, res) => {
  const { saleId, method, amountTendered } = req.body;
  
  // Validate required fields
  if (!saleId || !method) {
    return res.status(400).json({ message: 'Sale ID and payment method are required' });
  }
  
  // Find sale
  const sale = sales.find(sale => sale.id === saleId);
  
  if (!sale) {
    return res.status(404).json({ message: 'Sale not found' });
  }
  
  // Check if sale is already paid
  if (sale.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'This sale has already been paid' });
  }
  
  // Process payment
  const newPayment = new Payment(
    uuidv4(),
    saleId,
    sale.total,
    method,
    req.user.id
  );
  
  // Calculate change if cash payment
  if (method === 'cash' && amountTendered) {
    newPayment.calculateChange(parseFloat(amountTendered));
  }
  
  // Update sale status
  sale.complete(newPayment.id);
  
  // Add to payments array
  payments.push(newPayment);
  
  // If customer exists, update their purchase history
  if (sale.customerId) {
    const customer = customers.find(customer => customer.id === sale.customerId);
    if (customer) {
      customer.addPurchase(sale.id, sale.total);
    }
  }
  
  res.status(201).json({
    message: 'Payment processed successfully',
    payment: newPayment,
    sale: {
      id: sale.id,
      status: sale.status,
      paymentStatus: sale.paymentStatus
    }
  });
});

module.exports = router; 