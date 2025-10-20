const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  rank: {
    global: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    optimizedReviews: {
      type: Number,
      default: 0
    },
    totalImprovements: {
      type: Number,
      default: 0
    },
    averageImprovement: {
      type: Number,
      default: 0
    },
    codeQualityAverage: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    }
  },
  patterns: [{
    pattern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSAPattern'
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    lastPracticed: {
      type: Date
    }
  }],
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  badges: [{
    badgeId: String,
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userProgressSchema.index({ 'rank.global': 1 });
userProgressSchema.index({ level: -1 });
userProgressSchema.index({ experience: -1 });

// Method to add experience and level up
userProgressSchema.methods.addExperience = function(xp) {
  this.experience += xp;
  
  // Check for level up
  while (this.experience >= this.experienceToNextLevel) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    // Increase XP requirement for next level (exponential growth)
    this.experienceToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
  }
};

// Method to update streak
userProgressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.stats.lastActivityDate;
  
  if (!lastActivity) {
    this.stats.currentStreak = 1;
  } else {
    const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity === 0) {
      // Same day, do nothing
      return;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day, increment streak
      this.stats.currentStreak += 1;
    } else {
      // Streak broken, reset
      this.stats.currentStreak = 1;
    }
  }
  
  // Update longest streak if needed
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastActivityDate = now;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);

