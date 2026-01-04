const { v4: uuidv4 } = require('uuid');

const users = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123', // In a real application, this would be hashed
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user1',
    username: 'john_doe',
    password: 'password123', // In a real application, this would be hashed
    email: 'john@example.com',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'user2',
    username: 'jane_smith',
    password: 'password456', // In a real application, this would be hashed
    email: 'jane@example.com',
    role: 'user',
    createdAt: '2024-01-03T00:00:00Z'
  }
];

module.exports = users; 