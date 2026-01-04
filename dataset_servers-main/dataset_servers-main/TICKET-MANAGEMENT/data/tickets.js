const { v4: uuidv4 } = require('uuid');

const tickets = [
  {
    id: uuidv4(),
    title: 'System Login Issue',
    description: 'Users are unable to log in to the system',
    priority: 'high',
    status: 'open',
    createdBy: 'user1',
    assignedTo: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
    comments: [
      {
        id: uuidv4(),
        content: 'Initial report of the issue',
        createdBy: 'user1',
        createdAt: '2024-03-20T10:00:00Z'
      }
    ]
  },
  {
    id: uuidv4(),
    title: 'Database Backup',
    description: 'Schedule regular database backups',
    priority: 'medium',
    status: 'in-progress',
    createdBy: 'admin1',
    assignedTo: 'user2',
    createdAt: '2024-03-19T15:30:00Z',
    updatedAt: '2024-03-20T09:15:00Z',
    comments: [
      {
        id: uuidv4(),
        content: 'Backup script needs to be updated',
        createdBy: 'user2',
        createdAt: '2024-03-20T09:15:00Z'
      }
    ]
  }
];

module.exports = tickets; 