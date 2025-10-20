const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get user progress
router.get('/progress', dashboardController.getUserProgress);

// Get dashboard stats
router.get('/stats', dashboardController.getDashboardStats);

// Get recent reviews
router.get('/reviews', dashboardController.getRecentReviews);

// Get pattern progress
router.get('/patterns', dashboardController.getPatternProgress);

// Get leaderboard
router.get('/leaderboard', dashboardController.getLeaderboard);

// Get notifications
router.get('/notifications', dashboardController.getNotifications);

// Mark notification as read
router.patch('/notifications/:id/read', dashboardController.markNotificationRead);

module.exports = router;

