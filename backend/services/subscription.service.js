const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');

// ⚡ OPTIMIZATION: Simple in-memory cache for subscriptions
const subscriptionCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

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

  // Get user subscription (⚡ optimized with caching)
  async getUserSubscription(userId, skipCache = false) {
    try {
      const cacheKey = `sub:${userId}`;
      
      // ⚡ Check cache first (but don't cache Mongoose docs, they can cause issues)
      // Cache is more useful for stats queries
      
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
      
      // ⚡ Invalidate cache (both subscription and stats)
      subscriptionCache.delete(`sub:${userId}`);
      subscriptionCache.delete(`stats:${userId}`);
      
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
      
      // ⚡ Invalidate cache (both subscription and stats)
      subscriptionCache.delete(`sub:${userId}`);
      subscriptionCache.delete(`stats:${userId}`);
      
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  // Get subscription stats (⚡ optimized with caching)
  async getSubscriptionStats(userId) {
    try {
      const cacheKey = `stats:${userId}`;
      
      // ⚡ Check cache first for stats (safe to cache since it's just data)
      const cached = subscriptionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      // Fetch subscription with lean for better performance
      const subscription = await Subscription.findOne({ user: userId })
        .select('plan status usage features price billingCycle paymentInfo')
        .lean();
      
      if (!subscription) {
        // Create default and return default stats
        await this.createDefaultSubscription(userId);
        const defaultStats = {
          plan: 'starter',
          status: 'active',
          isActive: true,
          usage: { used: 0, limit: 3, remaining: 3 },
          features: {
            codeReviewsLimit: 3,
            hasAdvancedAI: false,
            hasPrioritySupport: false,
            hasTeamDashboard: false,
            hasCustomAI: false
          },
          billing: { price: 0, cycle: 'monthly', nextBillingDate: null }
        };
        
        subscriptionCache.set(cacheKey, { data: defaultStats, timestamp: Date.now() });
        return defaultStats;
      }

      const stats = {
        plan: subscription.plan,
        status: subscription.status,
        isActive: subscription.status === 'active',
        usage: {
          used: subscription.usage?.codeReviewsUsed || 0,
          limit: subscription.features?.codeReviewsLimit === -1 ? 'Unlimited' : subscription.features?.codeReviewsLimit || 3,
          remaining: subscription.features?.codeReviewsLimit === -1 
            ? 'Unlimited' 
            : Math.max(0, (subscription.features?.codeReviewsLimit || 3) - (subscription.usage?.codeReviewsUsed || 0))
        },
        features: subscription.features,
        billing: {
          price: subscription.price,
          cycle: subscription.billingCycle,
          nextBillingDate: subscription.paymentInfo?.nextBillingDate
        }
      };
      
      // ⚡ Cache the stats
      subscriptionCache.set(cacheKey, { data: stats, timestamp: Date.now() });
      
      // Clean up old cache entries
      if (subscriptionCache.size > 100) {
        const firstKey = subscriptionCache.keys().next().value;
        subscriptionCache.delete(firstKey);
      }
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }
  }
}

module.exports = new SubscriptionService();

