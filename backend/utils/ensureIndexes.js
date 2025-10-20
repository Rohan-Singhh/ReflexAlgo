const {
  User,
  Subscription,
  CodeReview,
  DSAPattern,
  UserProgress,
  Achievement,
  Notification,
  Team,
  Activity,
  Leaderboard
} = require('../models');

/**
 * Ensure all database indexes are created
 * This is called once on server startup for optimal query performance
 */
const ensureIndexes = async () => {
  try {
    await Promise.all([
      User.ensureIndexes(),
      Subscription.ensureIndexes(),
      CodeReview.ensureIndexes(),
      DSAPattern.ensureIndexes(),
      UserProgress.ensureIndexes(),
      Achievement.ensureIndexes(),
      Notification.ensureIndexes(),
      Team.ensureIndexes(),
      Activity.ensureIndexes(),
      Leaderboard.ensureIndexes()
    ]);
  } catch (error) {
    console.error('❌ Error ensuring indexes:', error);
    throw error;
  }
};

module.exports = ensureIndexes;
