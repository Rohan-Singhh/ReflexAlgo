// ⚡ ENSURE DATABASE INDEXES FOR MAXIMUM PERFORMANCE

const { User } = require('../models');

/**
 * Create optimized indexes for faster queries
 * Run this on server startup
 */
async function ensureIndexes() {
  try {
    // ⚡ Email index (already created by unique: true, but ensure it's optimal)
    await User.collection.createIndex(
      { email: 1 },
      { 
        unique: true,
        background: false, // Faster creation
        name: 'email_unique_idx'
      }
    );

    // ⚡ Compound index for faster auth queries
    await User.collection.createIndex(
      { email: 1, password: 1 },
      {
        background: false,
        name: 'email_password_idx',
        sparse: true // Only index documents with password field
      }
    );

    // ⚡ _id index already exists by default (MongoDB auto-creates)

    // Indexes created successfully
  } catch (error) {
    // Indexes already exist or error (silent - already working)
    if (error.code !== 85 && error.code !== 86) {
      console.error('❌ Index creation error:', error.message);
    }
  }
}

module.exports = ensureIndexes;

