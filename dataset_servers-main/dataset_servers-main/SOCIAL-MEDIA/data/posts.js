const { v4: uuidv4 } = require('uuid');

// In-memory post storage
const posts = [
  {
    id: '1',
    userId: '1',
    content: 'Just finished building my first React app! #coding #webdev',
    image: null,
    likes: ['2'],
    comments: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '2',
    content: 'Check out my latest photography project! #photography #art',
    image: 'https://example.com/images/photo.jpg',
    likes: ['1'],
    comments: ['3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper functions
const findPostById = (id) => posts.find(post => post.id === id);
const findPostsByUserId = (userId) => posts.filter(post => post.userId === userId);

// Create a new post
const createPost = (userId, postData) => {
  const { content, image } = postData;
  
  // Create new post
  const newPost = {
    id: uuidv4(),
    userId,
    content,
    image: image || null,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  return newPost;
};

// Update post
const updatePost = (id, userId, postData) => {
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    throw new Error('Post not found');
  }
  
  // Check if user is the owner of the post
  if (posts[postIndex].userId !== userId) {
    throw new Error('Not authorized to update this post');
  }
  
  // Update post data
  posts[postIndex] = {
    ...posts[postIndex],
    ...postData,
    updatedAt: new Date().toISOString()
  };
  
  return posts[postIndex];
};

// Delete post
const deletePost = (id, userId) => {
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    throw new Error('Post not found');
  }
  
  // Check if user is the owner of the post
  if (posts[postIndex].userId !== userId) {
    throw new Error('Not authorized to delete this post');
  }
  
  // Remove post
  posts.splice(postIndex, 1);
  return true;
};

// Like a post
const likePost = (postId, userId) => {
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    throw new Error('Post not found');
  }
  
  // Check if user already liked the post
  const likeIndex = posts[postIndex].likes.indexOf(userId);
  
  if (likeIndex === -1) {
    // Add like
    posts[postIndex].likes.push(userId);
  } else {
    // Remove like
    posts[postIndex].likes.splice(likeIndex, 1);
  }
  
  return posts[postIndex];
};

// Get all posts
const getAllPosts = () => {
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
  findPostById,
  findPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getAllPosts
}; 