const { v4: uuidv4 } = require('uuid');

// In-memory comment storage
const comments = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    content: 'Great job! Looks amazing!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    postId: '1',
    userId: '1',
    content: 'Thanks! It was a lot of work but worth it.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    postId: '2',
    userId: '1',
    content: 'Beautiful photos! What camera do you use?',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper functions
const findCommentById = (id) => comments.find(comment => comment.id === id);
const findCommentsByPostId = (postId) => comments.filter(comment => comment.postId === postId);
const findCommentsByUserId = (userId) => comments.filter(comment => comment.userId === userId);

// Create a new comment
const createComment = (userId, postId, content) => {
  // Create new comment
  const newComment = {
    id: uuidv4(),
    userId,
    postId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  comments.push(newComment);
  return newComment;
};

// Delete comment
const deleteComment = (id, userId) => {
  const commentIndex = comments.findIndex(comment => comment.id === id);
  
  if (commentIndex === -1) {
    throw new Error('Comment not found');
  }
  
  // Check if user is the owner of the comment
  if (comments[commentIndex].userId !== userId) {
    throw new Error('Not authorized to delete this comment');
  }
  
  // Remove comment
  comments.splice(commentIndex, 1);
  return true;
};

// Get all comments
const getAllComments = () => {
  return [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
  findCommentById,
  findCommentsByPostId,
  findCommentsByUserId,
  createComment,
  deleteComment,
  getAllComments
}; 