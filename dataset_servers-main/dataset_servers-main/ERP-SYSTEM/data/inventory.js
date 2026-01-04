const { v4: uuidv4 } = require('uuid');

const items = [
  {
    id: uuidv4(),
    name: 'Laptop',
    sku: 'TECH-001',
    category: 'Electronics',
    description: 'High-performance business laptop',
    price: 1200.00,
    cost: 800.00,
    supplier: 'TechVendor Inc.'
  },
  {
    id: uuidv4(),
    name: 'Office Desk',
    sku: 'FURN-001',
    category: 'Furniture',
    description: 'Ergonomic office desk',
    price: 350.00,
    cost: 200.00,
    supplier: 'Office Solutions Ltd'
  },
  {
    id: uuidv4(),
    name: 'Printer',
    sku: 'TECH-002',
    category: 'Electronics',
    description: 'Multi-function printer',
    price: 450.00,
    cost: 300.00,
    supplier: 'TechVendor Inc.'
  }
];

const stockLevels = items.map(item => ({
  itemId: item.id,
  quantity: Math.floor(Math.random() * 100) + 1,
  location: 'Main Warehouse',
  minimumLevel: 10,
  reorderLevel: 20
}));

module.exports = {
  items,
  stockLevels
}; 