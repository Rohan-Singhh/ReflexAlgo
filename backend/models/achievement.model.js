const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // Emoji or icon name
    default: '🏆'
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  category: {
    type: String,
    enum: ['reviews', 'patterns', 'streak', 'quality', 'speed', 'social', 'special'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['reviews_count', 'patterns_mastered', 'streak_days', 'quality_score', 'improvements', 'special'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    description: String
  },
  rewards: {
    experience: {
      type: Number,
      default: 0
    },
    badge: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unlockedBy: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster lookups (slug already has unique index from schema)
achievementSchema.index({ category: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

