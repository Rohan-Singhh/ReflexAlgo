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
      improved: Boolean,
      explanation: String,
      bottlenecks: [String],
      proofOfImprovement: String
    },
    spaceComplexity: {
      before: String,
      after: String,
      improved: Boolean,
      explanation: String,
      memoryImpact: String,
      tradeoffs: String
    },
    improvementPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    performanceMetrics: {
      estimatedSpeedup: String,
      scalability: String,
      worstCaseScenario: String,
      realWorldImpact: String
    },
    optimizationSuggestions: [{
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      lineNumber: Number,
      impact: String,
      codeExample: String,
      estimatedEffort: String,
      alternatives: [String]
    }],
    detectedPatterns: [{
      pattern: String,
      confidence: String,
      location: String,
      usage: String
    }],
    codeSmells: [{
      type: String,
      issue: String,
      location: String,
      severity: String,
      fix: String
    }],
    securityConcerns: [{
      issue: String,
      severity: String,
      recommendation: String,
      lineNumber: Number
    }],
    bestPractices: {
      followed: [String],
      missing: [String],
      recommendations: [String]
    },
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    readabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    maintainabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    testabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityBreakdown: {
      codeQuality: {
        score: Number,
        factors: mongoose.Schema.Types.Mixed
      },
      readability: {
        score: Number,
        factors: mongoose.Schema.Types.Mixed
      }
    },
    learningResources: [{
      topic: String,
      url: String,
      relevance: String
    }],
    nextSteps: [String],
    estimatedROI: {
      developmentTime: String,
      performanceGain: String,
      maintenanceReduction: String,
      userExperienceImprovement: String
    },
    note: String
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
codeReviewSchema.index({ 'analysis.detectedPatterns.pattern': 1 });
codeReviewSchema.index({ language: 1 });
codeReviewSchema.index({ 'analysis.codeQualityScore': 1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);

