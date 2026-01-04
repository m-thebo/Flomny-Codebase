const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const bookings = require('../data/bookings');

// @route   POST /checkout
// @desc    Complete checkout process
// @access  Private
router.post('/', auth, (req, res) => {
  const { bookingId, paymentMethod, specialRequests } = req.body;
  
  // Validate required fields
  if (!bookingId || !paymentMethod) {
    return res.status(400).json({ message: 'Please provide booking ID and payment method' });
  }
  
  // Find booking
  const booking = bookings.find(booking => booking.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  // Check if user is authorized to checkout this booking
  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Check if booking is in pending status
  if (booking.status !== 'pending') {
    return res.status(400).json({ message: `Cannot checkout a booking with status: ${booking.status}` });
  }
  
  // Update booking
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  if (specialRequests) {
    booking.specialRequests = specialRequests;
  }
  
  // In a real application, payment processing would happen here
  
  res.json({
    message: 'Checkout completed successfully',
    booking
  });
});

module.exports = router; 