/**
 * ⚡ Cache Warmer Utility
 * Preloads critical data into cache to ensure fast first requests
 */

const { UserProgress, Leaderboard } = require('../models');

/**
 * Warm up cache for a specific user
 * Called after login or on critical operations
 */
const warmUserCache = async (userId) => {
  try {
    // Preload user progress and leaderboard data in parallel
    await Promise.allSettled([
      UserProgress.findOne({ user: userId })
        .select('stats level experience experienceToNextLevel')
        .lean(),
      Leaderboard.findOne({ user: userId, period: 'all-time' })
        .select('rank rankChange')
        .lean()
    ]);
  } catch (error) {
    // Silently fail - cache warming is not critical
  }
};

/**
 * Warm up global cache data
 * Called on server startup or periodically
 */
const warmGlobalCache = async () => {
  try {
    // Preload top leaderboard entries
    await Leaderboard.find({ period: 'all-time' })
      .populate('user', 'name')
      .select('rank score rankChange user')
      .sort({ rank: 1 })
      .limit(10)
      .lean();
  } catch (error) {
    // Silently fail - cache warming is not critical
  }
};

/**
 * Schedule periodic cache warming for active users
 * This keeps frequently accessed data hot in cache
 */
const schedulePeriodicWarming = () => {
  // Warm global cache every 5 minutes
  setInterval(async () => {
    try {
      await warmGlobalCache();
    } catch (error) {
      // Silently fail - cache warming is not critical
    }
  }, 5 * 60 * 1000);
};

module.exports = {
  warmUserCache,
  warmGlobalCache,
  schedulePeriodicWarming
};

