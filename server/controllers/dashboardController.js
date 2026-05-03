const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get dashboard analytics (role-based)
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id || req.user._id;

    // Build base queries based on role
    const basePostQuery = isAdmin ? {} : { author: userId };
    const publishedPostQuery = { ...basePostQuery, status: 'published' };

    // Build base query for comments
    let commentQuery = {};
    if (!isAdmin) {
      // Find all post IDs authored by this user
      const userPosts = await Post.find(basePostQuery).select('_id').lean();
      const postIds = userPosts.map(p => p._id);
      commentQuery = { post: { $in: postIds } };
    }

    // 1. Total counts
    const totalBlogs = await Post.countDocuments(basePostQuery);
    const publishedBlogs = await Post.countDocuments(publishedPostQuery);
    const draftBlogs = totalBlogs - publishedBlogs;
    const totalComments = await Comment.countDocuments(commentQuery);

    // Sum of all views
    const viewsAggregation = await Post.aggregate([
      { $match: basePostQuery },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    // 2. Sentiment distribution
    const [positive, neutral, negative] = await Promise.all([
      Comment.countDocuments({ ...commentQuery, sentiment: 'Positive' }),
      Comment.countDocuments({ ...commentQuery, sentiment: 'Neutral' }),
      Comment.countDocuments({ ...commentQuery, sentiment: 'Negative' })
    ]);

    // 3. Top blogs (top 5 by views) - usually only published ones matter for "top"
    const topBlogsRaw = await Post.find(publishedPostQuery)
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

    // 4. Recent blogs (latest 5 published)
    const recentBlogs = await Post.find(publishedPostQuery)
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
        publishedBlogs,
        draftBlogs,
        totalComments,
        totalViews,
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
