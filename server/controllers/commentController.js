const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { getSentiment } = require('../utils/sentiment');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    // Validate
    if (!postId || !text) {
      return res.status(400).json({ success: false, message: 'Post ID and text are required' });
    }

    if (text.length < 2 || text.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment text must be between 2 and 500 characters' });
    }

    // Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Clean text (remove HTML tags)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();

    // Generate sentiment using the utility
    const sentiment = getSentiment(cleanText);

    // Save comment in DB
    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text: cleanText,
      sentiment
    });

    // Increment Post.commentCount using $inc
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Return created comment
    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get comments by post ID
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch comments by postId, populate user name only, sort newest first
    const comments = await Comment.find({ post: postId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: comments.length, comments });
  } catch (error) {
    console.error('getCommentsByPost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the comment by ID
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // 3. Find the post using comment.post
    const post = await Post.findById(comment.post);

    // 4. Authorization logic
    const isAdmin = req.user.role === 'admin';
    const userId = (req.user._id || req.user.id).toString();
    const isCommentOwner = comment.user.toString() === userId;
    const isPostOwner = post && post.author.toString() === userId;

    if (!isAdmin && !isCommentOwner && !isPostOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment' });
    }

    // 5. After authorization: Decrement Post.commentCount using $inc and Delete comment
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
  deleteComment
};
