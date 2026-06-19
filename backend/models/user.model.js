const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Pre-computed constants
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const USERNAME_REGEX = /^[a-z0-9_]+$/;
const URL_MAX = 200;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [EMAIL_REGEX, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePhoto: {
    type: String,
    default: null,
    trim: true
  },

  // ── Public profile identity ──
  username: {
    type: String,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [USERNAME_REGEX, 'Username can only contain lowercase letters, numbers, and underscores']
  },
  headline: {
    type: String,
    trim: true,
    maxlength: [80, 'Headline cannot exceed 80 characters'],
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [280, 'Bio cannot exceed 280 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: [80, 'Location cannot exceed 80 characters'],
    default: ''
  },
  links: {
    github: { type: String, trim: true, maxlength: URL_MAX, default: '' },
    linkedin: { type: String, trim: true, maxlength: URL_MAX, default: '' },
    website: { type: String, trim: true, maxlength: URL_MAX, default: '' },
    twitter: { type: String, trim: true, maxlength: URL_MAX, default: '' }
  },
  preferredLanguages: {
    type: [String],
    default: []
  },
  goal: {
    type: String,
    trim: true,
    maxlength: [120, 'Goal cannot exceed 120 characters'],
    default: ''
  },
  visibility: {
    isPublic: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true },
    showReviews: { type: Boolean, default: true }
  },

  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true
});

// Unique username, but sparse so legacy users without one don't collide before backfill
userSchema.index({ username: 1 }, { unique: true, sparse: true });

// Password hashing is handled in the service layer (see auth.service) to allow
// parallel hashing and avoid double-hashing.

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive/internal fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Email index is created automatically by 'unique: true'

module.exports = mongoose.model('User', userSchema);
