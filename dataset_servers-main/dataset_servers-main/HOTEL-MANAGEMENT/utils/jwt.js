const jwt = require('jsonwebtoken');

// Secret key for JWT (In a real app, use process.env.JWT_SECRET)
const JWT_SECRET = 'jwtSecret';

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
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