const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const products = require('../data/products');

// @route   GET /products
// @desc    Get a list of all products in the inventory
// @access  Private
router.get('/', auth, (req, res) => {
  // Optional query parameters for filtering
  const { category, minPrice, maxPrice, inStock } = req.query;
  
  let filteredProducts = [...products];
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= parseFloat(minPrice)
    );
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(product => 
      product.price <= parseFloat(maxPrice)
    );
  }
  
  // Filter by stock availability
  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(product => product.stock > 0);
  }
  
  res.json(filteredProducts);
});

// @route   GET /products/:id
// @desc    Get detailed information about a specific product
// @access  Private
router.get('/:id', auth, (req, res) => {
  const product = products.find(product => product.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// @route   POST /products
// @desc    Add a new product to the inventory (admin only)
// @access  Private/Admin
router.post('/', [auth, adminOnly], (req, res) => {
  const { name, description, price, stock, category, barcode, cost } = req.body;
  
  // Validate required fields
  if (!name || !price || !stock || !category) {
    return res.status(400).json({ message: 'Please provide all required fields: name, price, stock, category' });
  }
  
  // Check if product with same barcode already exists
  if (barcode && products.some(product => product.barcode === barcode)) {
    return res.status(400).json({ message: 'Product with this barcode already exists' });
  }
  
  // Create new product
  const newProduct = new Product(
    uuidv4(),
    name,
    description || '',
    parseFloat(price),
    parseInt(stock),
    category,
    barcode || null,
    parseFloat(cost) || 0
  );
  
  // Add to products array
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product added successfully',
    product: newProduct
  });
});

// @route   PUT /products/:id
// @desc    Update product details (admin only)
// @access  Private/Admin
router.put('/:id', [auth, adminOnly], (req, res) => {
  const { name, description, price, stock, category, barcode, cost } = req.body;
  
  // Find product index
  const productIndex = products.findIndex(product => product.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const product = products[productIndex];
  
  // Update fields if provided
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = parseFloat(price);
  if (stock !== undefined) product.stock = parseInt(stock);
  if (category) product.category = category;
  if (barcode) product.barcode = barcode;
  if (cost) product.cost = parseFloat(cost);
  
  // Update timestamp
  product.updatedAt = new Date();
  
  res.json({
    message: 'Product updated successfully',
    product
  });
});

// @route   DELETE /products/:id
// @desc    Remove a product from the inventory (admin only)
// @access  Private/Admin
router.delete('/:id', [auth, adminOnly], (req, res) => {
  const productIndex = products.findIndex(product => product.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Remove product
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
});

module.exports = router; 