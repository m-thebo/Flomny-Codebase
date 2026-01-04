const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const inventoryRoutes = require('./routes/inventory');
const procurementRoutes = require('./routes/procurement');
const salesRoutes = require('./routes/sales');
const financeRoutes = require('./routes/finance');
const hrRoutes = require('./routes/hr');
const manufacturingRoutes = require('./routes/manufacturing');
const logisticsRoutes = require('./routes/logistics');
const systemRoutes = require('./routes/system');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route middleware
app.use('/inventory', inventoryRoutes);
app.use('/procurement', procurementRoutes);
app.use('/sales', salesRoutes);
app.use('/finance', financeRoutes);
app.use('/hr', hrRoutes);
app.use('/manufacturing', manufacturingRoutes);
app.use('/logistics', logisticsRoutes);
app.use('/system', systemRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the ERP System API',
    version: '1.0.0',
    endpoints: [
      '/inventory',
      '/procurement',
      '/sales',
      '/finance',
      '/hr',
      '/manufacturing',
      '/logistics',
      '/system'
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 