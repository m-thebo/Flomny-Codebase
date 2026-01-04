const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');

// Create mock rooms
const rooms = [
  new Room(
    uuidv4(),
    'Standard Single Room',
    'standard',
    99.99,
    1,
    'Comfortable single room with all basic amenities',
    ['wifi', 'tv', 'air-conditioning'],
    ['standard_single_1.jpg', 'standard_single_2.jpg']
  ),
  new Room(
    uuidv4(),
    'Deluxe Double Room',
    'deluxe',
    149.99,
    2,
    'Spacious room with a queen-sized bed and premium amenities',
    ['wifi', 'tv', 'air-conditioning', 'mini-bar', 'safe'],
    ['deluxe_double_1.jpg', 'deluxe_double_2.jpg']
  ),
  new Room(
    uuidv4(),
    'Executive Suite',
    'suite',
    249.99,
    2,
    'Luxury suite with separate living area and premium amenities',
    ['wifi', 'tv', 'air-conditioning', 'mini-bar', 'safe', 'jacuzzi', 'workspace'],
    ['exec_suite_1.jpg', 'exec_suite_2.jpg', 'exec_suite_3.jpg']
  ),
  new Room(
    uuidv4(),
    'Family Room',
    'family',
    199.99,
    4,
    'Spacious room ideal for families with two queen-sized beds',
    ['wifi', 'tv', 'air-conditioning', 'mini-bar', 'safe', 'child-friendly'],
    ['family_room_1.jpg', 'family_room_2.jpg']
  ),
  new Room(
    uuidv4(),
    'Presidential Suite',
    'suite',
    499.99,
    2,
    'Our most luxurious suite with panoramic views and exceptional amenities',
    ['wifi', 'tv', 'air-conditioning', 'mini-bar', 'safe', 'jacuzzi', 'workspace', 'dining-area', 'concierge'],
    ['presidential_1.jpg', 'presidential_2.jpg', 'presidential_3.jpg', 'presidential_4.jpg']
  )
];

module.exports = rooms; 