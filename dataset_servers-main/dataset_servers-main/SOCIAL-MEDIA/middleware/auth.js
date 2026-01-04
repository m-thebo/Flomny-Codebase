const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to check if user is authorized to access a resource
 */
const authorizeUser = (req, res, next) => {
  // Check if user is trying to access their own resource
  if (req.user.id === req.params.id) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Not authorized to access this resource.' });
  }
};

module.exports = {
  verifyToken,
  authorizeUser
}; 