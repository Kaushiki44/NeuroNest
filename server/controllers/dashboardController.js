const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get dashboard analytics (role-based)
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id || req.user._id;

    // Build base query for posts based on role
    const postQuery = { status: 'published' };
    if (!isAdmin) {
      postQuery.author = userId;
    }

    // Build base query for comments
    let commentQuery = {};
    if (!isAdmin) {
      // Find all post IDs authored by this user
      const userPosts = await Post.find({ author: userId }).select('_id').lean();
      const postIds = userPosts.map(p => p._id);
      commentQuery = { post: { $in: postIds } };
    }

    // 1. Total counts
    const totalBlogs = await Post.countDocuments(postQuery);
    const totalComments = await Comment.countDocuments(commentQuery);

    // 2. Sentiment distribution
    const [positive, neutral, negative] = await Promise.all([
      Comment.countDocuments({ ...commentQuery, sentiment: 'Positive' }),
      Comment.countDocuments({ ...commentQuery, sentiment: 'Neutral' }),
      Comment.countDocuments({ ...commentQuery, sentiment: 'Negative' })
    ]);

    // 3. Top blogs (top 5 by views)
    const topBlogsRaw = await Post.find(postQuery)
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes commentCount')
      .lean();

    // Map likes array to a count for cleaner JSON payload
    const topBlogs = topBlogsRaw.map(blog => ({
      _id: blog._id,
      title: blog.title,
      views: blog.views || 0,
      likes: blog.likes ? blog.likes.length : 0,
      commentCount: blog.commentCount || 0
    }));

    // 4. Recent blogs (latest 5)
    const recentBlogs = await Post.find(postQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt author')
      .populate('author', 'name')
      .lean();

    // 5. Return JSON payload
    res.status(200).json({
      success: true,
      data: {
        totalBlogs,
        totalComments,
        sentimentStats: {
          positive,
          neutral,
          negative
        },
        topBlogs,
        recentBlogs
      }
    });

  } catch (error) {
    console.error('getDashboardData error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

module.exports = {
  getDashboardData
};
