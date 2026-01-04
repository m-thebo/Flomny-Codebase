const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const paymentRoutes = require('./routes/payments');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);
app.use('/customers', customerRoutes);
app.use('/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to POS System API',
    endpoints: {
      auth: '/auth',
      products: '/products',
      sales: '/sales',
      customers: '/customers',
      payments: '/payments'
    }
  });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 