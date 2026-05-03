const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboardData } = require('../controllers/dashboardController');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get system-wide dashboard statistics
// @access  Private
router.get('/', protect, getDashboardData);

module.exports = router;
