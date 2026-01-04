const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory user storage
const users = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    fullName: 'John Doe',
    bio: 'Software developer and tech enthusiast',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('password123', 10),
    fullName: 'Jane Doe',
    bio: 'Digital artist and photographer',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper functions
const findUserById = (id) => users.find(user => user.id === id);
const findUserByEmail = (email) => users.find(user => user.email === email);
const findUserByUsername = (username) => users.find(user => user.username === username);

// Create a new user
const createUser = (userData) => {
  const { username, email, password, fullName, bio } = userData;
  
  // Check if user already exists
  if (findUserByEmail(email)) {
    throw new Error('User with this email already exists');
  }
  
  if (findUserByUsername(username)) {
    throw new Error('Username already taken');
  }
  
  // Create new user
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    fullName: fullName || '',
    bio: bio || '',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Update user
const updateUser = (id, userData) => {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

// Update user avatar
const updateUserAvatar = (id, avatarUrl) => {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update avatar
  users[userIndex].avatar = avatarUrl;
  users[userIndex].updatedAt = new Date().toISOString();
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

// Get all users (without passwords)
const getAllUsers = () => {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  createUser,
  updateUser,
  updateUserAvatar,
  getAllUsers
}; 