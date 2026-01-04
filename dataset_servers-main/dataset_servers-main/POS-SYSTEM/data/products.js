const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');

// Create mock products
const products = [
  new Product(
    uuidv4(),
    'T-Shirt Basic',
    'Plain cotton t-shirt in various colors',
    19.99,
    100,
    'Clothing',
    'TSHIRT001',
    8.50
  ),
  new Product(
    uuidv4(),
    'Denim Jeans',
    'Classic blue denim jeans',
    49.99,
    50,
    'Clothing',
    'JEANS001',
    22.00
  ),
  new Product(
    uuidv4(),
    'Smartphone X',
    'Latest smartphone model with 128GB storage',
    599.99,
    20,
    'Electronics',
    'PHONE001',
    400.00
  ),
  new Product(
    uuidv4(),
    'Bluetooth Headphones',
    'Wireless noise-cancelling headphones',
    129.99,
    30,
    'Electronics',
    'HEAD001',
    70.00
  ),
  new Product(
    uuidv4(),
    'Coffee Maker',
    'Programmable coffee maker, 12-cup capacity',
    79.99,
    15,
    'Home Appliances',
    'COFFEE001',
    35.00
  ),
  new Product(
    uuidv4(),
    'Notebook',
    'Hardcover notebook, 200 pages',
    12.99,
    200,
    'Stationery',
    'NOTE001',
    5.00
  ),
  new Product(
    uuidv4(),
    'Chocolate Bar',
    'Premium milk chocolate',
    3.49,
    500,
    'Food',
    'CHOC001',
    1.20
  ),
  new Product(
    uuidv4(),
    'Water Bottle',
    'Reusable BPA-free water bottle, 750ml',
    15.99,
    100,
    'Accessories',
    'BOTTLE001',
    6.00
  ),
  new Product(
    uuidv4(),
    'LED Desk Lamp',
    'Adjustable brightness desk lamp',
    29.99,
    40,
    'Home Accessories',
    'LAMP001',
    14.00
  ),
  new Product(
    uuidv4(),
    'Backpack',
    'Waterproof laptop backpack',
    39.99,
    45,
    'Accessories',
    'BACK001',
    18.00
  )
];

module.exports = products; 