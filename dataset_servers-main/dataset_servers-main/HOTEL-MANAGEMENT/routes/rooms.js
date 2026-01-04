const express = require('express');
const router = express.Router();

const rooms = require('../data/rooms');

// @route   GET /rooms
// @desc    Browse available rooms with filtering options
// @access  Public
router.get('/', (req, res) => {
  let { type, minPrice, maxPrice, capacity, startDate, endDate, available } = req.query;
  
  let filteredRooms = [...rooms];
  
  // Filter by type
  if (type) {
    filteredRooms = filteredRooms.filter(room => room.type === type);
  }
  
  // Filter by price range
  if (minPrice) {
    filteredRooms = filteredRooms.filter(room => room.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    filteredRooms = filteredRooms.filter(room => room.price <= parseFloat(maxPrice));
  }
  
  // Filter by capacity
  if (capacity) {
    filteredRooms = filteredRooms.filter(room => room.capacity >= parseInt(capacity));
  }
  
  // Filter by availability for the date range
  if (startDate && endDate && available === 'true') {
    filteredRooms = filteredRooms.filter(room => !room.isBooked(startDate, endDate));
  }
  
  res.json(filteredRooms);
});

// @route   GET /rooms/:id
// @desc    Get specific room details
// @access  Public
router.get('/:id', (req, res) => {
  const room = rooms.find(room => room.id === req.params.id);
  
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  res.json(room);
});

module.exports = router; 