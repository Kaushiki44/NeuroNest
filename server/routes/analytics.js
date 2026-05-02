const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserAnalytics } = require('../services/analyticsService');

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get user analytics and top performing posts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const analytics = await getUserAnalytics(req.user._id);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

module.exports = router;
