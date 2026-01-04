const express = require('express');
const cors = require('cors');
const ticketsRouter = require('./routes/tickets');
const usersRouter = require('./routes/users');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/tickets', ticketsRouter);
app.use('/users', usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Ticket Management API is running on port ${port}`);
}); 