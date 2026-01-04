const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { vendors, purchaseOrders } = require('../data/procurement');

// GET /procurement/vendors
router.get('/vendors', (req, res) => {
  res.json(vendors);
});

// POST /procurement/vendors
router.post('/vendors', (req, res) => {
  const newVendor = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  vendors.push(newVendor);
  res.status(201).json(newVendor);
});

// GET /procurement/vendors/{vendorId}
router.get('/vendors/:vendorId', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.vendorId);
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  res.json(vendor);
});

// GET /procurement/purchase-orders
router.get('/purchase-orders', (req, res) => {
  res.json(purchaseOrders);
});

// POST /procurement/purchase-orders
router.post('/purchase-orders', (req, res) => {
  const { vendorId, items, ...orderData } = req.body;
  
  // Validate required fields
  if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      message: 'Vendor ID and at least one item are required'
    });
  }
  
  // Check if vendor exists
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const newOrder = {
    id: uuidv4(),
    vendorId,
    items,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    total,
    ...orderData,
    createdAt: new Date().toISOString()
  };
  
  purchaseOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /procurement/purchase-orders/{orderId}
router.get('/purchase-orders/:orderId', (req, res) => {
  const order = purchaseOrders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Purchase order not found' });
  }
  res.json(order);
});

// PUT /procurement/purchase-orders/{orderId}/status
router.put('/purchase-orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const order = purchaseOrders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Purchase order not found' });
  }
  
  // Validate status transition
  const validStatusTransitions = {
    'pending': ['approved', 'cancelled'],
    'approved': ['in-progress', 'cancelled'],
    'in-progress': ['partial', 'delivered', 'cancelled'],
    'partial': ['delivered', 'cancelled'],
    'delivered': ['completed'],
    'cancelled': []
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