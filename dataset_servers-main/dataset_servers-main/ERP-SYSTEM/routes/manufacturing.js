const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { productionOrders, materialRequests } = require('../data/manufacturing');

// GET /manufacturing/orders
router.get('/orders', (req, res) => {
  // Support filtering by status
  if (req.query.status) {
    const filteredOrders = productionOrders.filter(o => o.status === req.query.status);
    return res.json(filteredOrders);
  }
  
  // Support filtering by product
  if (req.query.product) {
    const filteredOrders = productionOrders.filter(o => 
      o.product.toLowerCase().includes(req.query.product.toLowerCase())
    );
    return res.json(filteredOrders);
  }
  
  res.json(productionOrders);
});

// POST /manufacturing/orders
router.post('/orders', (req, res) => {
  const { product, quantity, startDate, dueDate, ...orderData } = req.body;
  
  // Validate required fields
  if (!product || !quantity || !dueDate) {
    return res.status(400).json({ 
      message: 'Product, quantity, and due date are required'
    });
  }
  
  const newOrder = {
    id: uuidv4(),
    product,
    quantity: parseInt(quantity),
    startDate: startDate || new Date().toISOString().split('T')[0],
    dueDate,
    status: 'scheduled',
    completedQuantity: 0,
    ...orderData,
    createdAt: new Date().toISOString()
  };
  
  productionOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /manufacturing/orders/{productionOrderId}
router.get('/orders/:productionOrderId', (req, res) => {
  const order = productionOrders.find(o => o.id === req.params.productionOrderId);
  if (!order) {
    return res.status(404).json({ message: 'Production order not found' });
  }
  
  // Include related material requests
  const relatedMaterialRequests = materialRequests.filter(
    m => m.productionOrderId === req.params.productionOrderId
  );
  
  res.json({
    ...order,
    materialRequests: relatedMaterialRequests
  });
});

// POST /manufacturing/material-requests
router.post('/material-requests', (req, res) => {
  const { productionOrderId, items, ...requestData } = req.body;
  
  // Validate required fields
  if (!productionOrderId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      message: 'Production order ID and at least one material item are required'
    });
  }
  
  // Check if production order exists
  const productionOrder = productionOrders.find(o => o.id === productionOrderId);
  if (!productionOrder) {
    return res.status(404).json({ message: 'Production order not found' });
  }
  
  const newMaterialRequest = {
    id: uuidv4(),
    productionOrderId,
    items,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    ...requestData,
    createdAt: new Date().toISOString()
  };
  
  materialRequests.push(newMaterialRequest);
  res.status(201).json(newMaterialRequest);
});

// GET /manufacturing/material-requests/{requestId}
router.get('/material-requests/:requestId', (req, res) => {
  const request = materialRequests.find(r => r.id === req.params.requestId);
  if (!request) {
    return res.status(404).json({ message: 'Material request not found' });
  }
  
  // Include related production order
  const productionOrder = productionOrders.find(o => o.id === request.productionOrderId);
  
  res.json({
    ...request,
    productionOrder
  });
});

module.exports = router; 