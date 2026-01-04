const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { shipments, tracking } = require('../data/logistics');
const { orders } = require('../data/sales');

// GET /logistics/shipments
router.get('/shipments', (req, res) => {
  // Support filtering by status
  if (req.query.status) {
    const filteredShipments = shipments.filter(s => s.status === req.query.status);
    return res.json(filteredShipments);
  }
  
  // Support filtering by carrier
  if (req.query.carrier) {
    const filteredShipments = shipments.filter(s => s.carrier === req.query.carrier);
    return res.json(filteredShipments);
  }
  
  // Support filtering by order ID
  if (req.query.orderId) {
    const filteredShipments = shipments.filter(s => s.orderId === req.query.orderId);
    return res.json(filteredShipments);
  }
  
  res.json(shipments);
});

// POST /logistics/shipments
router.post('/shipments', (req, res) => {
  const { orderId, carrier, type, source, destination, ...shipmentData } = req.body;
  
  // Validate required fields
  if ((!orderId && !type) || !carrier) {
    return res.status(400).json({ 
      message: 'Either order ID or shipment type, plus carrier are required'
    });
  }
  
  // If it's an order shipment, check if order exists
  if (orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order already has a shipment
    const existingShipment = shipments.find(s => s.orderId === orderId);
    if (existingShipment) {
      return res.status(400).json({ 
        message: 'A shipment already exists for this order',
        existingShipment
      });
    }
  }
  
  // If it's an inventory transfer, validate source and destination
  if (type === 'inventory-transfer') {
    if (!source || !destination) {
      return res.status(400).json({
        message: 'Source and destination are required for inventory transfers'
      });
    }
  }
  
  // Generate tracking number if not provided
  const trackingNumber = shipmentData.trackingNumber || 
    `${carrier.substring(0, 3).toUpperCase()}${Date.now().toString().substring(5)}`;
  
  const shippingDate = new Date();
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // Default to 5 days for delivery
  
  const newShipment = {
    id: uuidv4(),
    orderId: orderId || null,
    carrier,
    trackingNumber,
    shippingDate: shipmentData.shippingDate || shippingDate.toISOString().split('T')[0],
    estimatedDelivery: shipmentData.estimatedDelivery || estimatedDelivery.toISOString().split('T')[0],
    status: 'pending',
    type: type || 'order-fulfillment',
    source: source || 'Main Warehouse',
    destination: destination,
    ...shipmentData,
    createdAt: new Date().toISOString()
  };
  
  // Create initial tracking event
  const initialTrackingEvent = {
    shipmentId: newShipment.id,
    events: [
      {
        timestamp: new Date().toISOString(),
        location: newShipment.source,
        status: 'Created',
        description: 'Shipment created and ready for processing'
      }
    ]
  };
  
  shipments.push(newShipment);
  tracking.push(initialTrackingEvent);
  
  res.status(201).json({
    shipment: newShipment,
    tracking: initialTrackingEvent
  });
});

// GET /logistics/shipments/{shipmentId}
router.get('/shipments/:shipmentId', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.shipmentId);
  if (!shipment) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  
  // Include related order details if applicable
  let relatedOrder = null;
  if (shipment.orderId) {
    relatedOrder = orders.find(o => o.id === shipment.orderId);
  }
  
  res.json({
    ...shipment,
    order: relatedOrder
  });
});

// GET /logistics/tracking/{shipmentId}
router.get('/tracking/:shipmentId', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.shipmentId);
  if (!shipment) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  
  // Get tracking events
  const trackingInfo = tracking.find(t => t.shipmentId === req.params.shipmentId);
  if (!trackingInfo) {
    return res.status(404).json({ message: 'Tracking information not found' });
  }
  
  res.json({
    shipment,
    events: trackingInfo.events
  });
});

module.exports = router;