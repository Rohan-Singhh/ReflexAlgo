const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  score: {
    type: Number,
    default: 0,
    index: -1 // Descending order for ranking
  },
  rank: {
    type: Number,
    default: 0
  },
  previousRank: {
    type: Number,
    default: 0
  },
  rankChange: {
    type: Number,
    default: 0
  },
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    averageImprovement: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['all-time', 'monthly', 'weekly'],
    default: 'all-time',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for leaderboard queries
leaderboardSchema.index({ period: 1, score: -1 });
leaderboardSchema.index({ period: 1, rank: 1 });

// Static method to calculate score
leaderboardSchema.statics.calculateScore = function(userData) {
  const {
    totalReviews = 0,
    averageImprovement = 0,
    level = 1,
    streak = 0,
    codeQualityAverage = 0
  } = userData;
  
  // More balanced scoring algorithm
  const score = (
    (totalReviews * 15) +           // Increased weight for total reviews
    (Math.min(averageImprovement, 100) * 3) + // Cap improvement at 100, reduce multiplier
    (level * 40) +                  // Slightly reduced level impact
    (Math.min(streak, 30) * 10) +   // Cap streak bonus, reduce multiplier
    (Math.min(codeQualityAverage, 100) * 1.5) // Cap quality score, reduce multiplier
  );
  
  return Math.floor(score);
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

