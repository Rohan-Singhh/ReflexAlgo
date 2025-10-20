const subscriptionService = require('../services/subscription.service');
const { errorHandler } = require('../utils');

// Get current user's subscription
exports.getMySubscription = errorHandler(async (req, res) => {
  const subscription = await subscriptionService.getUserSubscription(req.user._id);
  
  res.status(200).json({
    success: true,
    data: {
      subscription
    }
  });
});

// Get subscription stats
exports.getSubscriptionStats = errorHandler(async (req, res) => {
  const stats = await subscriptionService.getSubscriptionStats(req.user._id);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// Upgrade/Change plan
exports.changePlan = errorHandler(async (req, res) => {
  const { plan, paymentInfo } = req.body;
  
  if (!plan) {
    return res.status(400).json({
      success: false,
      message: 'Plan is required'
    });
  }

  // Validate plan
  const validPlans = ['starter', 'pro', 'team', 'enterprise'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan'
    });
  }

  const subscription = await subscriptionService.changePlan(
    req.user._id,
    plan,
    paymentInfo || {}
  );
  
  res.status(200).json({
    success: true,
    message: `Successfully upgraded to ${plan} plan`,
    data: {
      subscription
    }
  });
});

// Cancel subscription
exports.cancelSubscription = errorHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: {
      subscription
    }
  });
});

// Check if user can create code review (middleware-like endpoint)
exports.checkReviewLimit = errorHandler(async (req, res) => {
  const subscription = await subscriptionService.getUserSubscription(req.user._id);
  
  const canCreate = subscription.canCreateReview();
  
  res.status(200).json({
    success: true,
    data: {
      canCreate,
      used: subscription.usage.codeReviewsUsed,
      limit: subscription.features.codeReviewsLimit === -1 ? 'Unlimited' : subscription.features.codeReviewsLimit
    }
  });
});

