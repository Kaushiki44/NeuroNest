const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const { calculateQualityScore } = require('../services/qualityScore');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/my
// @desc    Get current user's posts (all statuses)
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID (increments views)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { title, content, tags, status, excerpt, thumbnail } = req.body;

      const { score: qualityScore, feedback: qualityFeedback } = calculateQualityScore(content);

      const post = await Post.create({
        title,
        content,
        thumbnail,
        excerpt: excerpt || undefined,
        tags: tags || [],
        status: status || 'draft',
        author: req.user._id,
        qualityScore,
        qualityFeedback,
      });

      await post.populate('author', 'name email');

      res.status(201).json({ success: true, post });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   PUT /api/posts/:id
// @desc    Update a post (owner only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    const { title, content, tags, status, excerpt, thumbnail } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.thumbnail = thumbnail !== undefined ? thumbnail : post.thumbnail;
    post.tags = tags !== undefined ? tags : post.tags;
    post.status = status || post.status;
    
    if (excerpt !== undefined) {
      post.excerpt = excerpt;
    } else if (content) {
      // Force excerpt regeneration to fix any old &nbsp; issues
      const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      post.excerpt = plainText.substring(0, 150).trim() + (plainText.length > 150 ? '...' : '');
    }

    if (content) {
      const { score, feedback } = calculateQualityScore(content);
      post.qualityScore = score;
      post.qualityFeedback = feedback;
    }

    await post.save();
    await post.populate('author', 'name email');

    res.json({ success: true, post });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (owner only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Simple sentiment analyzer
const analyzeSentiment = (text) => {
  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'amazing', 'fantastic', 'wonderful', 'best', 'helpful', 'thanks', 'thank you'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'stupid', 'useless', 'boring', 'poor', 'wrong'];
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });
  
  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
};

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post(
  '/:id/comments',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const { text } = req.body;
      const sentiment = analyzeSentiment(text);

      const comment = await Comment.create({
        post: req.params.id,
        user: req.user._id,
        text,
        sentiment
      });

      await comment.populate('user', 'name email');

      res.status(201).json({ success: true, comment });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await Post.findById(req.params.postId);
    
    // Make sure comment belongs to post
    if (comment.post.toString() !== req.params.postId) {
      return res.status(400).json({ success: false, message: 'Comment does not belong to this post' });
    }

    // Check ownership: comment author or post author can delete
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post && post.author.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.json({ success: true, message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
