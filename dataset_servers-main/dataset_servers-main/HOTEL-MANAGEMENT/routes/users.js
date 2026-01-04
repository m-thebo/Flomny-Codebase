const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const users = require('../data/users');
const bookings = require('../data/bookings');

// @route   GET /users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', auth, (req, res) => {
  // Check if user is fetching their own profile or if they have admin privileges
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const user = users.find(user => user.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get user's bookings
  const userBookings = bookings.filter(booking => booking.userId === user.id);

  // Create response object
  const responseUser = user.toJSON();
  responseUser.bookingDetails = userBookings;

  res.json(responseUser);
});

// @route   PUT /users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, (req, res) => {
  // Check if user is updating their own profile
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const userIndex = users.findIndex(user => user.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, phone } = req.body;

  // Update user
  if (name) users[userIndex].name = name;
  if (phone) users[userIndex].phone = phone;

  res.json({
    message: 'User updated successfully',
    user: users[userIndex].toJSON()
  });
});

module.exports = router; 