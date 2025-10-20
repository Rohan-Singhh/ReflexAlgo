const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['review_created', 'review_completed', 'level_up', 'achievement_unlocked', 'pattern_mastered', 'streak_milestone', 'team_joined', 'team_created'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  icon: {
    type: String
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId, // Can reference Review, Achievement, etc.
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['CodeReview', 'Achievement', 'DSAPattern', 'Team']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Flexible data
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

module.exports = mongoose.model('Activity', activitySchema);

