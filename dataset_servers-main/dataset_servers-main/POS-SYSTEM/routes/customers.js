const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const Customer = require('../models/Customer');
const customers = require('../data/customers');
const sales = require('../data/sales');

// @route   GET /customers
// @desc    Get a list of all customers
// @access  Private
router.get('/', auth, (req, res) => {
  const { name, email, phone } = req.query;
  
  let filteredCustomers = [...customers];
  
  // Filter by name (case-insensitive)
  if (name) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  // Filter by email
  if (email) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.email && customer.email.toLowerCase().includes(email.toLowerCase())
    );
  }
  
  // Filter by phone
  if (phone) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.phone && customer.phone.includes(phone)
    );
  }
  
  res.json(filteredCustomers);
});

// @route   GET /customers/:id
// @desc    Get detailed information about a specific customer
// @access  Private
router.get('/:id', auth, (req, res) => {
  const customer = customers.find(customer => customer.id === req.params.id);
  
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  // Get customer's sales
  const customerSales = sales.filter(sale => sale.customerId === customer.id);
  
  // Create response with sales summary
  const response = {
    ...customer,
    salesCount: customerSales.length,
    recentSales: customerSales
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(sale => ({
        id: sale.id,
        date: sale.date,
        total: sale.total,
        status: sale.status
      }))
  };
  
  res.json(response);
});

// @route   POST /customers
// @desc    Add a new customer
// @access  Private
router.post('/', auth, (req, res) => {
  const { name, email, phone, address } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  // Check if customer with same email already exists
  if (email && customers.some(customer => customer.email === email)) {
    return res.status(400).json({ message: 'Customer with this email already exists' });
  }
  
  // Create new customer
  const newCustomer = new Customer(
    uuidv4(),
    name,
    email || null,
    phone || null,
    address || null
  );
  
  // Add to customers array
  customers.push(newCustomer);
  
  res.status(201).json({
    message: 'Customer added successfully',
    customer: newCustomer
  });
});

// @route   PUT /customers/:id
// @desc    Update customer details
// @access  Private
router.put('/:id', auth, (req, res) => {
  const { name, email, phone, address } = req.body;
  
  // Find customer
  const customerIndex = customers.findIndex(customer => customer.id === req.params.id);
  
  if (customerIndex === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  const customer = customers[customerIndex];
  
  // Check if updating email to one that already exists
  if (email && email !== customer.email && customers.some(c => c.email === email)) {
    return res.status(400).json({ message: 'Customer with this email already exists' });
  }
  
  // Update customer data
  customer.update({
    name: name || customer.name,
    email: email !== undefined ? email : customer.email,
    phone: phone !== undefined ? phone : customer.phone,
    address: address !== undefined ? address : customer.address
  });
  
  res.json({
    message: 'Customer updated successfully',
    customer
  });
});

module.exports = router; 