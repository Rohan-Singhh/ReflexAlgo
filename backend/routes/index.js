const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const subscriptionRoutes = require('./subscription.routes');
const dashboardRoutes = require('./dashboard.routes');
const codeReviewRoutes = require('./codeReview.routes');

// Use route modules
router.use('/auth', authRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reviews', codeReviewRoutes);

module.exports = router;

