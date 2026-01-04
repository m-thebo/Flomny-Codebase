const { v4: uuidv4 } = require('uuid');
const { orders } = require('./sales');

const shipments = [
  {
    id: uuidv4(),
    orderId: orders[0].id,
    carrier: 'FedEx',
    trackingNumber: 'FDX123456789',
    shippingDate: '2023-03-20',
    estimatedDelivery: '2023-03-25',
    status: 'in-transit'
  },
  {
    id: uuidv4(),
    orderId: null, // Inventory transfer
    carrier: 'Internal',
    trackingNumber: 'INT987654321',
    shippingDate: '2023-03-18',
    estimatedDelivery: '2023-03-19',
    status: 'delivered',
    type: 'inventory-transfer',
    source: 'Main Warehouse',
    destination: 'Retail Store #2'
  }
];

const tracking = [
  {
    shipmentId: shipments[0].id,
    events: [
      {
        timestamp: '2023-03-20T10:30:00Z',
        location: 'Sorting Facility, Origin City',
        status: 'Picked up',
        description: 'Package received at carrier facility'
      },
      {
        timestamp: '2023-03-21T08:45:00Z',
        location: 'Transit Hub, Midpoint City',
        status: 'In Transit',
        description: 'Package in transit to destination'
      },
      {
        timestamp: '2023-03-22T14:20:00Z',
        location: 'Local Facility, Destination City',
        status: 'Out for Delivery',
        description: 'Package out for delivery'
      }
    ]
  },
  {
    shipmentId: shipments[1].id,
    events: [
      {
        timestamp: '2023-03-18T09:15:00Z',
        location: 'Main Warehouse',
        status: 'Picked up',
        description: 'Inventory loaded for transfer'
      },
      {
        timestamp: '2023-03-19T11:30:00Z',
        location: 'Retail Store #2',
        status: 'Delivered',
        description: 'Inventory received at destination'
      }
    ]
  }
];

module.exports = {
  shipments,
  tracking
}; 