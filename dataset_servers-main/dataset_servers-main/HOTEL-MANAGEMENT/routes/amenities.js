const express = require('express');
const router = express.Router();

const amenities = require('../data/amenities');

// @route   GET /amenities
// @desc    List available hotel amenities
// @access  Public
router.get('/', (req, res) => {
  const { type } = req.query;
  
  let filteredAmenities = [...amenities];
  
  // Filter by type if provided (hotel or room)
  if (type) {
    filteredAmenities = filteredAmenities.filter(amenity => amenity.type === type);
  }
  
  res.json(filteredAmenities);
});

module.exports = router; 