const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const amenityRoutes = require('./routes/amenities');
const bookingRoutes = require('./routes/bookings');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/amenities', amenityRoutes);
app.use('/bookings', bookingRoutes);
app.use('/checkout', require('./routes/checkout'));

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hotel Management API',
    endpoints: {
      auth: '/auth',
      users: '/users',
      rooms: '/rooms',
      amenities: '/amenities',
      bookings: '/bookings',
      checkout: '/checkout'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 