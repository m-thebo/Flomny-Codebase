const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  findCommentById, 
  createComment, 
  deleteComment 
} = require('../data/comments');
const { findPostById } = require('../data/posts');

// POST /posts/{id}/comments
router.post('/posts/:postId/comments', verifyToken, (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Check if post exists
    const post = findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const newComment = createComment(req.user.id, postId, content);
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /posts/{id}/comments
router.get('/posts/:postId/comments', verifyToken, (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get comments for post
    const comments = findCommentsByPostId(postId);
    
    // In a real application, you would fetch user info for each comment
    // For this mock server, we'll just return the comments with userId
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /comments/{id}
router.delete('/:id', verifyToken, (req, res) => {
  try {
    // Delete comment
    deleteComment(req.params.id, req.user.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 