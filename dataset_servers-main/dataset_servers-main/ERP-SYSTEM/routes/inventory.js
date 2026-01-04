const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { items, stockLevels } = require('../data/inventory');

// GET /inventory/items
router.get('/items', (req, res) => {
  res.json(items);
});

// GET /inventory/items/{itemId}
router.get('/items/:itemId', (req, res) => {
  const item = items.find(i => i.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
});

// POST /inventory/items
router.post('/items', (req, res) => {
  const newItem = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /inventory/items/{itemId}
router.put('/items/:itemId', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.itemId);
  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const updatedItem = {
    ...items[index],
    ...req.body,
    id: req.params.itemId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  items[index] = updatedItem;
  res.json(updatedItem);
});

// DELETE /inventory/items/{itemId}
router.delete('/items/:itemId', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.itemId);
  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  items.splice(index, 1);
  res.status(204).send();
});

// GET /inventory/stock-levels
router.get('/stock-levels', (req, res) => {
  res.json(stockLevels);
});

// POST /inventory/adjust-stock
router.post('/adjust-stock', (req, res) => {
  const { itemId, adjustment, reason } = req.body;
  
  if (!itemId || adjustment === undefined) {
    return res.status(400).json({ message: 'Item ID and adjustment amount are required' });
  }
  
  const stockLevel = stockLevels.find(s => s.itemId === itemId);
  if (!stockLevel) {
    return res.status(404).json({ message: 'Stock level for this item not found' });
  }
  
  // Adjust stock level
  stockLevel.quantity += parseInt(adjustment);
  stockLevel.lastUpdated = new Date().toISOString();
  
  // Record the adjustment
  const adjustmentRecord = {
    id: uuidv4(),
    itemId,
    previousQuantity: stockLevel.quantity - parseInt(adjustment),
    adjustment: parseInt(adjustment),
    newQuantity: stockLevel.quantity,
    reason,
    timestamp: new Date().toISOString()
  };
  
  res.json({
    stockLevel,
    adjustment: adjustmentRecord
  });
});

module.exports = router; 