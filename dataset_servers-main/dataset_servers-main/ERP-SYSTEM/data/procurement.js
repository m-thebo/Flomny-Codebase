const { v4: uuidv4 } = require('uuid');

const vendors = [
  {
    id: uuidv4(),
    name: 'TechVendor Inc.',
    contact: 'John Smith',
    email: 'john@techvendor.com',
    phone: '555-1234',
    address: '123 Tech St, Silicon Valley, CA'
  },
  {
    id: uuidv4(),
    name: 'Office Solutions Ltd',
    contact: 'Sarah Johnson',
    email: 'sarah@officesolutions.com',
    phone: '555-5678',
    address: '456 Office Ave, Business Park, NY'
  },
  {
    id: uuidv4(),
    name: 'Global Materials Co.',
    contact: 'Michael Wong',
    email: 'michael@globalmaterials.com',
    phone: '555-9012',
    address: '789 Industrial Rd, Manufacturing District, TX'
  }
];

const purchaseOrders = [
  {
    id: uuidv4(),
    vendorId: vendors[0].id,
    date: '2023-03-15',
    items: [
      { itemName: 'Laptop', quantity: 10, unitPrice: 800 },
      { itemName: 'Printer', quantity: 5, unitPrice: 300 }
    ],
    status: 'delivered',
    total: 9500
  },
  {
    id: uuidv4(),
    vendorId: vendors[1].id,
    date: '2023-03-20',
    items: [
      { itemName: 'Office Desk', quantity: 8, unitPrice: 200 },
      { itemName: 'Office Chair', quantity: 15, unitPrice: 150 }
    ],
    status: 'pending',
    total: 3850
  }
];

module.exports = {
  vendors,
  purchaseOrders
}; 