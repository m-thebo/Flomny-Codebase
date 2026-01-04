const jwt = require('jsonwebtoken');

// Secret key for JWT (In a real app, use process.env.JWT_SECRET)
const JWT_SECRET = 'posJwtSecret';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken,
  JWT_SECRET
}; 