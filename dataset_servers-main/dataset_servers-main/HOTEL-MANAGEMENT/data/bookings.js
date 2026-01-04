const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const users = require('./users');
const rooms = require('./rooms');

// Create mock bookings
const bookings = [
  new Booking(
    uuidv4(),
    users[0].id,
    rooms[1].id,
    '2025-01-10',
    '2025-01-15',
    2,
    149.99 * 5,
    'confirmed'
  ),
  new Booking(
    uuidv4(),
    users[1].id,
    rooms[2].id,
    '2025-02-05',
    '2025-02-10',
    2,
    249.99 * 5,
    'confirmed'
  )
];

// Add booking references to users
users[0].addBooking(bookings[0].id);
users[1].addBooking(bookings[1].id);

// Add booking dates to rooms
rooms[1].addBooking('2025-01-10', '2025-01-15');
rooms[2].addBooking('2025-02-05', '2025-02-10');

module.exports = bookings; 