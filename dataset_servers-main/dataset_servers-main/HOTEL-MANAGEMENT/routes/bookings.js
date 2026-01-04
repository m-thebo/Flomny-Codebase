const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const Booking = require('../models/Booking');
const bookings = require('../data/bookings');
const rooms = require('../data/rooms');
const users = require('../data/users');

// @route   POST /bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, (req, res) => {
  const { roomId, startDate, endDate, guests } = req.body;
  
  // Validate required fields
  if (!roomId || !startDate || !endDate || !guests) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  
  // Find room
  const room = rooms.find(room => room.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  // Check if room is available for the selected dates
  if (room.isBooked(startDate, endDate)) {
    return res.status(400).json({ message: 'Room is not available for the selected dates' });
  }
  
  // Check if guest count is valid
  if (guests > room.capacity) {
    return res.status(400).json({ message: `This room can only accommodate ${room.capacity} guests` });
  }
  
  // Calculate total price (days * room price)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = room.price * days;
  
  // Create new booking
  const newBooking = new Booking(
    uuidv4(),
    req.user.id,
    roomId,
    startDate,
    endDate,
    guests,
    totalPrice,
    'pending'
  );
  
  // Add booking to the data
  bookings.push(newBooking);
  
  // Add reference to user's bookings
  const user = users.find(user => user.id === req.user.id);
  user.addBooking(newBooking.id);
  
  // Mark dates as booked in the room
  room.addBooking(startDate, endDate);
  
  res.status(201).json({
    message: 'Booking created successfully',
    booking: newBooking
  });
});

// @route   GET /bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', auth, (req, res) => {
  const booking = bookings.find(booking => booking.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  // Check if user is authorized to view this booking
  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Get room details
  const room = rooms.find(room => room.id === booking.roomId);
  
  // Create response with room details
  const response = {
    ...booking,
    room: room || { message: 'Room details not available' }
  };
  
  res.json(response);
});

module.exports = router; 