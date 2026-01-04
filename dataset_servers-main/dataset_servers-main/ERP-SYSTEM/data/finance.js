const { v4: uuidv4 } = require('uuid');

const transactions = [
  {
    id: uuidv4(),
    type: 'income',
    amount: 6900,
    date: '2023-03-18',
    description: 'Payment from Acme Corporation',
    reference: 'INV-001',
    account: 'Sales Revenue'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 9500,
    date: '2023-03-15',
    description: 'Payment to TechVendor Inc.',
    reference: 'PO-001',
    account: 'Inventory Purchases'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 2500,
    date: '2023-03-01',
    description: 'Monthly Rent',
    reference: 'RENT-03-2023',
    account: 'Operating Expenses'
  }
];

const accounts = [
  {
    id: uuidv4(),
    name: 'Sales Revenue',
    type: 'income',
    balance: 12900
  },
  {
    id: uuidv4(),
    name: 'Inventory Purchases',
    type: 'expense',
    balance: 13350
  },
  {
    id: uuidv4(),
    name: 'Operating Expenses',
    type: 'expense',
    balance: 7500
  },
  {
    id: uuidv4(),
    name: 'Accounts Receivable',
    type: 'asset',
    balance: 6000
  }
];

module.exports = {
  transactions,
  accounts
}; 