const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');

class SubscriptionService {
  // Create default subscription for new user
  async createDefaultSubscription(userId) {
    try {
      const planFeatures = Subscription.getPlanFeatures('starter');
      
      const subscription = await Subscription.create({
        user: userId,
        plan: 'starter',
        status: 'active',
        price: 0,
        billingCycle: 'monthly',
        features: {
          codeReviewsLimit: planFeatures.codeReviewsLimit,
          hasAdvancedAI: planFeatures.hasAdvancedAI,
          hasPrioritySupport: planFeatures.hasPrioritySupport,
          hasTeamDashboard: planFeatures.hasTeamDashboard,
          hasCustomAI: planFeatures.hasCustomAI
        }
      });

      // Update user with subscription reference
      await User.findByIdAndUpdate(userId, { subscription: subscription._id });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Get user subscription
  async getUserSubscription(userId) {
    try {
      let subscription = await Subscription.findOne({ user: userId });
      
      // If no subscription exists, create default one
      if (!subscription) {
        subscription = await this.createDefaultSubscription(userId);
      }

      // Check and reset monthly usage if needed
      if (subscription.resetMonthlyUsage()) {
        await subscription.save();
      }

      return subscription;
    } catch (error) {
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  // Upgrade/Change subscription plan
  async changePlan(userId, newPlan, paymentInfo = {}) {
    try {
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const planFeatures = Subscription.getPlanFeatures(newPlan);
      
      subscription.plan = newPlan;
      subscription.price = planFeatures.price || 0;
      subscription.features = {
        codeReviewsLimit: planFeatures.codeReviewsLimit,
        hasAdvancedAI: planFeatures.hasAdvancedAI,
        hasPrioritySupport: planFeatures.hasPrioritySupport,
        hasTeamDashboard: planFeatures.hasTeamDashboard,
        hasCustomAI: planFeatures.hasCustomAI
      };

      // Update payment info if provided
      if (paymentInfo.stripeCustomerId) {
        subscription.paymentInfo.stripeCustomerId = paymentInfo.stripeCustomerId;
      }
      if (paymentInfo.stripeSubscriptionId) {
        subscription.paymentInfo.stripeSubscriptionId = paymentInfo.stripeSubscriptionId;
      }
      if (paymentInfo.nextBillingDate) {
        subscription.paymentInfo.nextBillingDate = paymentInfo.nextBillingDate;
      }

      subscription.paymentInfo.lastPaymentDate = new Date();
      
      await subscription.save();
      
      return subscription;
    } catch (error) {
      throw new Error(`Failed to change plan: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      
      // Keep active until end of billing period
      if (subscription.paymentInfo.nextBillingDate) {
        subscription.endDate = subscription.paymentInfo.nextBillingDate;
      } else {
        // If no billing date, expire immediately
        subscription.endDate = new Date();
        subscription.status = 'expired';
      }
      
      await subscription.save();
      
      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Increment code review usage
  async incrementUsage(userId) {
    try {
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Check and reset if needed
      subscription.resetMonthlyUsage();

      // Check if user can create review
      if (!subscription.canCreateReview()) {
        throw new Error('Code review limit reached. Please upgrade your plan.');
      }

      subscription.usage.codeReviewsUsed += 1;
      await subscription.save();
      
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  // Get subscription stats
  async getSubscriptionStats(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      const stats = {
        plan: subscription.plan,
        status: subscription.status,
        isActive: subscription.isActive(),
        usage: {
          used: subscription.usage.codeReviewsUsed,
          limit: subscription.features.codeReviewsLimit === -1 ? 'Unlimited' : subscription.features.codeReviewsLimit,
          remaining: subscription.features.codeReviewsLimit === -1 
            ? 'Unlimited' 
            : Math.max(0, subscription.features.codeReviewsLimit - subscription.usage.codeReviewsUsed)
        },
        features: subscription.features,
        billing: {
          price: subscription.price,
          cycle: subscription.billingCycle,
          nextBillingDate: subscription.paymentInfo.nextBillingDate
        }
      };
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }
  }
}

module.exports = new SubscriptionService();

