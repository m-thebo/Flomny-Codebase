const { v4: uuidv4 } = require('uuid');

const customers = [
  {
    id: uuidv4(),
    name: 'Acme Corporation',
    contact: 'Alice Brown',
    email: 'alice@acmecorp.com',
    phone: '555-2345',
    address: '123 Business Blvd, Enterprise City, CA'
  },
  {
    id: uuidv4(),
    name: 'Globex Inc.',
    contact: 'Bob Green',
    email: 'bob@globex.com',
    phone: '555-6789',
    address: '456 Corporate Dr, Commerce Town, NY'
  },
  {
    id: uuidv4(),
    name: 'Summit Industries',
    contact: 'Carol White',
    email: 'carol@summit.com',
    phone: '555-0123',
    address: '789 Peak St, Uptown, WA'
  }
];

const orders = [
  {
    id: uuidv4(),
    customerId: customers[0].id,
    date: '2023-03-18',
    items: [
      { itemName: 'Laptop', quantity: 5, unitPrice: 1200 },
      { itemName: 'Printer', quantity: 2, unitPrice: 450 }
    ],
    status: 'shipped',
    total: 6900
  },
  {
    id: uuidv4(),
    customerId: customers[1].id,
    date: '2023-03-22',
    items: [
      { itemName: 'Office Desk', quantity: 10, unitPrice: 350 },
      { itemName: 'Office Chair', quantity: 10, unitPrice: 250 }
    ],
    status: 'processing',
    total: 6000
  }
];

module.exports = {
  customers,
  orders
}; 