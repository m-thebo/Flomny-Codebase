const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const tickets = require('../data/tickets');
const users = require('../data/users');

// Basic Auth middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // In a real application, you would validate against a database
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.user = user;
  next();
};

// Admin level middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /tickets
router.get('/', (req, res) => {
  const { status, priority, assignedTo } = req.query;
  let filteredTickets = [...tickets];

  if (status) {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
  }
  if (priority) {
    filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
  }
  if (assignedTo) {
    filteredTickets = filteredTickets.filter(ticket => ticket.assignedTo === assignedTo);
  }

  res.json(filteredTickets);
});

// POST /tickets
router.post('/', basicAuth, (req, res) => {
  const { title, description, priority = 'medium' } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const newTicket = {
    id: uuidv4(),
    title,
    description,
    priority,
    status: 'open',
    createdBy: req.user.id,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: []
  };

  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// GET /tickets/{ticketId}
router.get('/:ticketId', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json(ticket);
});

// PUT /tickets/{ticketId}
router.put('/:ticketId', basicAuth, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const { title, description, assignedTo } = req.body;
  if (title) ticket.title = title;
  if (description) ticket.description = description;
  if (assignedTo) ticket.assignedTo = assignedTo;
  ticket.updatedAt = new Date().toISOString();

  res.json(ticket);
});

// DELETE /tickets/{ticketId}
router.delete('/:ticketId', basicAuth, (req, res) => {
  const index = tickets.findIndex(t => t.id === req.params.ticketId);
  if (index === -1) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  tickets.splice(index, 1);
  res.status(204).send();
});

// GET /tickets/{ticketId}/comments
router.get('/:ticketId/comments', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json(ticket.comments);
});

// POST /tickets/{ticketId}/comments
router.post('/:ticketId/comments', basicAuth, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  const newComment = {
    id: uuidv4(),
    content,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  ticket.comments.push(newComment);
  ticket.updatedAt = new Date().toISOString();
  res.status(201).json(newComment);
});

// GET /tickets/{ticketId}/status
router.get('/:ticketId/status', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json({ status: ticket.status });
});

// PUT /tickets/{ticketId}/status
router.put('/:ticketId/status', basicAuth, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const { status } = req.body;
  if (!status || !['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  res.json({ status: ticket.status });
});

// GET /tickets/{ticketId}/priority
router.get('/:ticketId/priority', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json({ priority: ticket.priority });
});

// PUT /tickets/{ticketId}/priority
router.put('/:ticketId/priority', basicAuth, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const { priority } = req.body;
  if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' });
  }

  ticket.priority = priority;
  ticket.updatedAt = new Date().toISOString();
  res.json({ priority: ticket.priority });
});

module.exports = router; 