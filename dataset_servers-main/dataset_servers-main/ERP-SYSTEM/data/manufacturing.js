const { v4: uuidv4 } = require('uuid');

const productionOrders = [
  {
    id: uuidv4(),
    product: 'Custom Office Desk',
    quantity: 50,
    startDate: '2023-03-10',
    dueDate: '2023-04-10',
    status: 'in-progress',
    completedQuantity: 20
  },
  {
    id: uuidv4(),
    product: 'Executive Chair',
    quantity: 25,
    startDate: '2023-03-15',
    dueDate: '2023-03-30',
    status: 'scheduled',
    completedQuantity: 0
  }
];

const materialRequests = [
  {
    id: uuidv4(),
    productionOrderId: productionOrders[0].id,
    date: '2023-03-09',
    items: [
      { material: 'Wood Panels', quantity: 200 },
      { material: 'Metal Legs', quantity: 200 },
      { material: 'Screws', quantity: 2000 }
    ],
    status: 'fulfilled'
  },
  {
    id: uuidv4(),
    productionOrderId: productionOrders[1].id,
    date: '2023-03-14',
    items: [
      { material: 'Fabric', quantity: 50 },
      { material: 'Foam Padding', quantity: 25 },
      { material: 'Chair Base', quantity: 25 }
    ],
    status: 'pending'
  }
];

module.exports = {
  productionOrders,
  materialRequests
}; 