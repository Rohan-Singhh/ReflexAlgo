const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ⚡ OPTIMIZED: Pre-computed constants
const SALT_ROUNDS = 9;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

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
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, {
  timestamps: true,
  strict: true, // ⚡ OPTIMIZED: Reject undefined fields
  strictQuery: true // ⚡ OPTIMIZED: Strict query mode
});

// ⚡ OPTIMIZED: Password hashing is handled in the service layer for better control
// This allows parallel operations and caching optimizations
// Pre-save hook removed to prevent double-hashing

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ⚡ OPTIMIZED: Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v; // ⚡ Also remove version key
  return obj;
};

// ⚡ Email index is automatically created by 'unique: true'

module.exports = mongoose.model('User', userSchema);
