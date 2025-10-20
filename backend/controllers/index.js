// Centralized controller exports
const authController = require('./auth.controller');
const subscriptionController = require('./subscription.controller');
const dashboardController = require('./dashboard.controller');
const codeReviewController = require('./codeReview.controller');

module.exports = {
  authController,
  subscriptionController,
  dashboardController,
  codeReviewController
};

