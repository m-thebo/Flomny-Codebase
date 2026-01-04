const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const Sale = require('../models/Sale');
const sales = require('../data/sales');
const products = require('../data/products');
const customers = require('../data/customers');

// @route   GET /sales
// @desc    Get a list of all completed sales transactions
// @access  Private
router.get('/', auth, (req, res) => {
  const { status, startDate, endDate, customerId } = req.query;
  
  let filteredSales = [...sales];
  
  // Filter by status
  if (status) {
    filteredSales = filteredSales.filter(sale => sale.status === status);
  }
  
  // Filter by date range
  if (startDate) {
    const start = new Date(startDate);
    filteredSales = filteredSales.filter(sale => new Date(sale.date) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day
    filteredSales = filteredSales.filter(sale => new Date(sale.date) <= end);
  }
  
  // Filter by customer
  if (customerId) {
    filteredSales = filteredSales.filter(sale => sale.customerId === customerId);
  }
  
  res.json(filteredSales);
});

// @route   GET /sales/:id
// @desc    Get details of a specific sale transaction
// @access  Private
router.get('/:id', auth, (req, res) => {
  const sale = sales.find(sale => sale.id === req.params.id);
  
  if (!sale) {
    return res.status(404).json({ message: 'Sale not found' });
  }
  
  // Get customer details if available
  let customerDetails = null;
  if (sale.customerId) {
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      customerDetails = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      };
    }
  }
  
  const response = {
    ...sale,
    customer: customerDetails
  };
  
  res.json(response);
});

// @route   POST /sales
// @desc    Create a new sale transaction
// @access  Private
router.post('/', auth, (req, res) => {
  const { items, customerId } = req.body;
  
  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Please provide valid items for the sale' });
  }
  
  // Validate each item and calculate subtotals
  const validatedItems = [];
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ message: 'Each item must have a valid productId and quantity' });
    }
    
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
    }
    
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}: requested ${item.quantity}, available ${product.stock}` });
    }
    
    validatedItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    });
    
    // Update product stock
    product.updateStock(-item.quantity);
  }
  
  // Validate customer if provided
  if (customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
  }
  
  // Create new sale
  const newSale = new Sale(
    uuidv4(),
    validatedItems,
    req.user.id,
    customerId || null
  );
  
  // Add to sales array
  sales.push(newSale);
  
  res.status(201).json({
    message: 'Sale created successfully',
    sale: newSale
  });
});

module.exports = router; 