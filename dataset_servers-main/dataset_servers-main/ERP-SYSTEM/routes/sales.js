const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { customers, orders } = require('../data/sales');

// GET /sales/customers
router.get('/customers', (req, res) => {
  res.json(customers);
});

// POST /sales/customers
router.post('/customers', (req, res) => {
  const newCustomer = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// GET /sales/customers/{customerId}
router.get('/customers/:customerId', (req, res) => {
  const customer = customers.find(c => c.id === req.params.customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

// GET /sales/orders
router.get('/orders', (req, res) => {
  // Support filtering by customer ID
  if (req.query.customerId) {
    const customerOrders = orders.filter(o => o.customerId === req.query.customerId);
    return res.json(customerOrders);
  }
  
  // Support filtering by status
  if (req.query.status) {
    const filteredOrders = orders.filter(o => o.status === req.query.status);
    return res.json(filteredOrders);
  }
  
  res.json(orders);
});

// POST /sales/orders
router.post('/orders', (req, res) => {
  const { customerId, items, ...orderData } = req.body;
  
  // Validate required fields
  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      message: 'Customer ID and at least one item are required'
    });
  }
  
  // Check if customer exists
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const newOrder = {
    id: uuidv4(),
    customerId,
    items,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    total,
    ...orderData,
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /sales/orders/{orderId}
router.get('/orders/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

// PUT /sales/orders/{orderId}/status
router.put('/orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  // Validate status transition
  const validStatusTransitions = {
    'pending': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'returned'],
    'delivered': ['completed', 'returned'],
    'returned': ['refunded'],
    'completed': [],
    'cancelled': [],
    'refunded': []
  };
  
  if (!validStatusTransitions[order.status].includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status transition from ${order.status} to ${status}`,
      validTransitions: validStatusTransitions[order.status]
    });
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  // Add status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  
  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    user: req.body.user || 'system'
  });
  
  res.json(order);
});

module.exports = router; 