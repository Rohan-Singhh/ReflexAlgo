const mongoose = require('mongoose');

const dsaPatternSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  emoji: {
    type: String,
    default: '🧠'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Array', 'String', 'LinkedList', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Sorting', 'Searching', 'Math', 'Other'],
    default: 'Other'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  totalProblems: {
    type: Number,
    default: 10
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'documentation']
    }
  }],
  examples: [{
    title: String,
    code: String,
    explanation: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster pattern lookups (slug already has unique index from schema)
dsaPatternSchema.index({ category: 1 });

module.exports = mongoose.model('DSAPattern', dsaPatternSchema);

