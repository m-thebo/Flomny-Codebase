const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { transactions, accounts } = require('../data/finance');

// GET /finance/transactions
router.get('/transactions', (req, res) => {
  // Support filtering by type
  if (req.query.type) {
    const filteredTransactions = transactions.filter(t => t.type === req.query.type);
    return res.json(filteredTransactions);
  }
  
  // Support filtering by account
  if (req.query.account) {
    const filteredTransactions = transactions.filter(t => t.account === req.query.account);
    return res.json(filteredTransactions);
  }
  
  // Support date range filtering
  if (req.query.startDate && req.query.endDate) {
    const filteredTransactions = transactions.filter(t => {
      return t.date >= req.query.startDate && t.date <= req.query.endDate;
    });
    return res.json(filteredTransactions);
  }
  
  res.json(transactions);
});

// POST /finance/transactions
router.post('/transactions', (req, res) => {
  const { type, amount, account, ...transactionData } = req.body;
  
  // Validate required fields
  if (!type || !amount || !account) {
    return res.status(400).json({ 
      message: 'Transaction type, amount, and account are required'
    });
  }
  
  // Check if account exists
  const accountObject = accounts.find(a => a.name === account);
  if (!accountObject) {
    return res.status(404).json({ message: 'Account not found' });
  }
  
  const newTransaction = {
    id: uuidv4(),
    type,
    amount: parseFloat(amount),
    account,
    date: new Date().toISOString().split('T')[0],
    ...transactionData,
    createdAt: new Date().toISOString()
  };
  
  // Update account balance
  if (type === 'income') {
    accountObject.balance += parseFloat(amount);
  } else if (type === 'expense') {
    accountObject.balance -= parseFloat(amount);
  }
  
  transactions.push(newTransaction);
  res.status(201).json({
    transaction: newTransaction,
    account: accountObject
  });
});

// GET /finance/transactions/{transactionId}
router.get('/transactions/:transactionId', (req, res) => {
  const transaction = transactions.find(t => t.id === req.params.transactionId);
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  res.json(transaction);
});

// GET /finance/accounts
router.get('/accounts', (req, res) => {
  // Support filtering by type
  if (req.query.type) {
    const filteredAccounts = accounts.filter(a => a.type === req.query.type);
    return res.json(filteredAccounts);
  }
  
  res.json(accounts);
});

// POST /finance/accounts
router.post('/accounts', (req, res) => {
  const { name, type, initialBalance, ...accountData } = req.body;
  
  // Validate required fields
  if (!name || !type) {
    return res.status(400).json({ 
      message: 'Account name and type are required'
    });
  }
  
  // Check if account with the same name already exists
  const existingAccount = accounts.find(a => a.name === name);
  if (existingAccount) {
    return res.status(400).json({ message: 'Account with this name already exists' });
  }
  
  const newAccount = {
    id: uuidv4(),
    name,
    type,
    balance: parseFloat(initialBalance || 0),
    ...accountData,
    createdAt: new Date().toISOString()
  };
  
  accounts.push(newAccount);
  res.status(201).json(newAccount);
});

module.exports = router; 