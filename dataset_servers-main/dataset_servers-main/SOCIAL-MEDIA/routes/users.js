const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, authorizeUser } = require('../middleware/auth');
const { 
  findUserById, 
  updateUser, 
  updateUserAvatar, 
  getAllUsers 
} = require('../data/users');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET /users/{id}
router.get('/:id', verifyToken, (req, res) => {
  try {
    const user = findUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /users/{id}
router.put('/:id', verifyToken, authorizeUser, (req, res) => {
  try {
    const { fullName, bio } = req.body;
    
    // Update user
    const updatedUser = updateUser(req.params.id, { fullName, bio });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /users/{id}/avatar
router.patch('/:id/avatar', verifyToken, authorizeUser, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Update user avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = updateUserAvatar(req.params.id, avatarUrl);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /users (admin only)
router.get('/', verifyToken, (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    // For this mock server, we'll just return all users
    const users = getAllUsers();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 