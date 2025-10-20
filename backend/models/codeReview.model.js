const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  language: {
    type: String,
    required: true,
    enum: ['JavaScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust', 'TypeScript', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'C#', 'Other']
  },
  code: {
    type: String,
    required: true,
    maxlength: 50000 // Max 50KB of code
  },
  lineCount: {
    type: Number,
    required: true
  },
  analysis: {
    timeComplexity: {
      before: String,
      after: String,
      improved: Boolean
    },
    spaceComplexity: {
      before: String,
      after: String,
      improved: Boolean
    },
    improvementPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    optimizationSuggestions: [{
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      lineNumber: Number
    }],
    detectedPatterns: [{
      type: String,
      ref: 'DSAPattern'
    }],
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    readabilityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  optimizedCode: {
    type: String,
    maxlength: 50000
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed', 'optimal'],
    default: 'pending'
  },
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  processingTime: {
    type: Number // in milliseconds
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
codeReviewSchema.index({ user: 1, createdAt: -1 });
codeReviewSchema.index({ status: 1 });
codeReviewSchema.index({ 'analysis.detectedPatterns': 1 });
codeReviewSchema.index({ language: 1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);

