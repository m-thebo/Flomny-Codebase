const { v4: uuidv4 } = require('uuid');
const Amenity = require('../models/Amenity');

// Create mock amenities
const amenities = [
  // Hotel amenities
  new Amenity(
    uuidv4(),
    'Swimming Pool',
    'Outdoor swimming pool with lounging area',
    'pool-icon',
    'hotel'
  ),
  new Amenity(
    uuidv4(),
    'Fitness Center',
    'Fully equipped gym with modern equipment',
    'gym-icon',
    'hotel'
  ),
  new Amenity(
    uuidv4(),
    'Spa',
    'Full-service spa offering massages and treatments',
    'spa-icon',
    'hotel'
  ),
  new Amenity(
    uuidv4(),
    'Restaurant',
    'On-site restaurant serving breakfast, lunch, and dinner',
    'restaurant-icon',
    'hotel'
  ),
  new Amenity(
    uuidv4(),
    'Conference Room',
    'Meeting spaces for business travelers',
    'conference-icon',
    'hotel'
  ),
  
  // Room amenities
  new Amenity(
    uuidv4(),
    'WiFi',
    'High-speed wireless internet access',
    'wifi-icon',
    'room'
  ),
  new Amenity(
    uuidv4(),
    'TV',
    'Flat-screen TV with cable channels',
    'tv-icon',
    'room'
  ),
  new Amenity(
    uuidv4(),
    'Mini Bar',
    'In-room refrigerator with drinks and snacks',
    'minibar-icon',
    'room'
  ),
  new Amenity(
    uuidv4(),
    'Safe',
    'In-room safe for valuables',
    'safe-icon',
    'room'
  ),
  new Amenity(
    uuidv4(),
    'Air Conditioning',
    'Individual climate control',
    'ac-icon',
    'room'
  )
];

module.exports = amenities; 