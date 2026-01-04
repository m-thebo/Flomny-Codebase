const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { 
  findPostById, 
  findPostsByUserId, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost, 
  getAllPosts 
} = require('../data/posts');
const { findCommentsByPostId } = require('../data/comments');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// POST /posts
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Create post
    const postData = {
      content,
      image: req.file ? `/uploads/posts/${req.file.filename}` : null
    };
    
    const newPost = createPost(req.user.id, postData);
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /posts
router.get('/', verifyToken, (req, res) => {
  try {
    const posts = getAllPosts();
    
    // Add user info to each post
    const postsWithUserInfo = posts.map(post => {
      // In a real application, you would fetch user info from a database
      // For this mock server, we'll just return the post with userId
      return post;
    });
    
    res.json(postsWithUserInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /posts/{id}
router.get('/:id', verifyToken, (req, res) => {
  try {
    const post = findPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // In a real application, you would fetch user info from a database
    // For this mock server, we'll just return the post with userId
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /posts/{id}
router.put('/:id', verifyToken, (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Update post
    const updatedPost = updatePost(req.params.id, req.user.id, { content });
    
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /posts/{id}
router.delete('/:id', verifyToken, (req, res) => {
  try {
    // Delete post
    deletePost(req.params.id, req.user.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /posts/{id}/like
router.post('/:id/like', verifyToken, (req, res) => {
  try {
    // Like/unlike post
    const updatedPost = likePost(req.params.id, req.user.id);
    
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /posts/{id}/comments
router.get('/:id/comments', verifyToken, (req, res) => {
  try {
    const post = findPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get comments for post
    const comments = findCommentsByPostId(req.params.id);
    
    // In a real application, you would fetch user info for each comment
    // For this mock server, we'll just return the comments with userId
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 