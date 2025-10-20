const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get current user's subscription
router.get('/me', subscriptionController.getMySubscription);

// Get subscription stats
router.get('/stats', subscriptionController.getSubscriptionStats);

// Change/upgrade plan
router.post('/change-plan', subscriptionController.changePlan);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Check review limit
router.get('/check-limit', subscriptionController.checkReviewLimit);

module.exports = router;

