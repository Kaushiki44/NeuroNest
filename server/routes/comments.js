const express = require('express');
const {
  addComment,
  getCommentsByPost,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/comments
// @desc    Add a comment
// @access  Private
router.post('/', protect, addComment);

// @route   GET /api/comments/:postId
// @desc    Get comments by post ID
// @access  Public
router.get('/:postId', getCommentsByPost);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, deleteComment);

module.exports = router;
