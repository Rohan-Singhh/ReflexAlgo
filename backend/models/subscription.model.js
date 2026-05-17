const mongoose = require('mongoose');

const PAID_PLANS = ['pro', 'team', 'enterprise'];

function addBillingPeriod(fromDate, billingCycle = 'monthly') {
  const nextDate = new Date(fromDate);
  if (billingCycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
}

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['starter', 'pro', 'team', 'enterprise'],
    default: 'starter'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: {
    codeReviewsLimit: {
      type: Number,
      default: 3 // Free users get only 3 AI code reviews
    },
    hasAdvancedAI: {
      type: Boolean,
      default: false
    },
    hasPrioritySupport: {
      type: Boolean,
      default: false
    },
    hasTeamDashboard: {
      type: Boolean,
      default: false
    },
    hasCustomAI: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    codeReviewsUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  paymentInfo: {
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    lastPaymentDate: Date,
    nextBillingDate: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries (user already has unique index from schema)
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ plan: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  const expiry = this.getExpiryDate();
  return this.status === 'active' && (!expiry || expiry > Date.now());
};

// Method to check if plan is paid
subscriptionSchema.methods.isPaidPlan = function() {
  return PAID_PLANS.includes(this.plan);
};

// Method to resolve the active paid/free period expiry
subscriptionSchema.methods.getExpiryDate = function() {
  if (this.endDate) return new Date(this.endDate);
  if (this.paymentInfo?.nextBillingDate) return new Date(this.paymentInfo.nextBillingDate);
  if (this.isPaidPlan() && this.paymentInfo?.lastPaymentDate) {
    return addBillingPeriod(this.paymentInfo.lastPaymentDate, this.billingCycle);
  }
  if (this.isPaidPlan() && this.startDate) {
    return addBillingPeriod(this.startDate, this.billingCycle);
  }
  return null;
};

// Method to check if a paid plan should keep access
subscriptionSchema.methods.hasActivePaidAccess = function() {
  if (!this.isPaidPlan()) return false;
  if (this.status !== 'active') return false;

  const expiry = this.getExpiryDate();
  if (!expiry) return true;

  return expiry.getTime() > Date.now();
};

// Method to check if user can create code review
subscriptionSchema.methods.canCreateReview = function() {
  if (this.plan === 'starter') {
    return this.usage.codeReviewsUsed < this.features.codeReviewsLimit;
  }
  // Pro and above have unlimited reviews
  return true;
};

// Method to reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Check if a month has passed
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.codeReviewsUsed = 0;
    this.usage.lastResetDate = now;
    return true;
  }
  return false;
};

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function(planName) {
  const plans = {
    starter: {
      codeReviewsLimit: 3, // Free users get only 3 AI code reviews
      hasAdvancedAI: false,
      hasPrioritySupport: false,
      hasTeamDashboard: false,
      hasCustomAI: false,
      price: 0
    },
    pro: {
      codeReviewsLimit: -1, // Unlimited
      hasAdvancedAI: true,
      hasPrioritySupport: true,
      hasTeamDashboard: false,
      hasCustomAI: false,
      price: 4
    },
    team: {
      codeReviewsLimit: -1, // Unlimited
      hasAdvancedAI: true,
      hasPrioritySupport: true,
      hasTeamDashboard: true,
      hasCustomAI: false,
      price: 3 // per user
    },
    enterprise: {
      codeReviewsLimit: -1, // Unlimited
      hasAdvancedAI: true,
      hasPrioritySupport: true,
      hasTeamDashboard: true,
      hasCustomAI: true,
      price: null // Custom pricing
    }
  };
  
  return plans[planName] || plans.starter;
};

subscriptionSchema.statics.getPaidPlans = function() {
  return [...PAID_PLANS];
};

subscriptionSchema.statics.addBillingPeriod = addBillingPeriod;

module.exports = mongoose.model('Subscription', subscriptionSchema);
