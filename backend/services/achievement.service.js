/**
 * Achievements / badges engine.
 *
 * Achievements are defined in code (single source of truth) and awarded into
 * `UserProgress.badges`. Evaluation is idempotent: a badge is only ever granted
 * once. The engine never revokes badges (e.g. if a streak later breaks).
 *
 * Callers:
 *   1. `evaluateAchievements(progress)` — mutate progress.badges, return newly earned.
 *   2. `createAchievementNotifications(userId, earned)` — persist notifications.
 */

const { Notification } = require('../models');

/**
 * Catalog. Each entry's `test(ctx)` receives a flattened progress snapshot.
 * `rarity` and `icon` are surfaced to the client (see frontend badge catalog).
 */
const ACHIEVEMENTS = [
  { id: 'first_review', name: 'First Review', description: 'Submitted your first code review', icon: 'sparkles', rarity: 'common', test: (c) => c.totalReviews >= 1 },
  { id: 'reviews_10', name: 'Getting Started', description: 'Completed 10 code reviews', icon: 'code', rarity: 'common', test: (c) => c.totalReviews >= 10 },
  { id: 'reviews_50', name: 'Code Reviewer', description: 'Completed 50 code reviews', icon: 'code', rarity: 'rare', test: (c) => c.totalReviews >= 50 },
  { id: 'optimizer_10', name: 'Optimizer', description: 'Optimized 10 solutions', icon: 'zap', rarity: 'rare', test: (c) => c.optimizedReviews >= 10 },
  { id: 'quality_guru', name: 'Quality Guru', description: 'Maintained an 85+ average quality score', icon: 'gem', rarity: 'epic', test: (c) => c.totalReviews >= 5 && c.codeQualityAverage >= 85 },
  { id: 'streak_7', name: 'Consistent', description: 'Reached a 7-day activity streak', icon: 'flame', rarity: 'rare', test: (c) => c.longestStreak >= 7 },
  { id: 'streak_30', name: 'Unstoppable', description: 'Reached a 30-day activity streak', icon: 'flame', rarity: 'epic', test: (c) => c.longestStreak >= 30 },
  { id: 'pattern_master', name: 'Pattern Master', description: 'Mastered a DSA pattern (70%+)', icon: 'layers', rarity: 'rare', test: (c) => c.patternsMastered >= 1 },
  { id: 'problems_25', name: 'Problem Solver', description: 'Solved 25 practice problems', icon: 'target', rarity: 'rare', test: (c) => c.problemsSolved >= 25 },
  { id: 'problems_100', name: 'Century', description: 'Solved 100 practice problems', icon: 'trophy', rarity: 'epic', test: (c) => c.problemsSolved >= 100 },
  { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: 'star', rarity: 'rare', test: (c) => c.level >= 5 },
  { id: 'level_10', name: 'Veteran', description: 'Reached level 10', icon: 'crown', rarity: 'epic', test: (c) => c.level >= 10 }
];

const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/**
 * Flatten a UserProgress document into the snapshot the tests consume.
 */
function buildContext(progress) {
  const stats = progress?.stats || {};
  const patterns = progress?.patterns || [];
  return {
    totalReviews: stats.totalReviews || 0,
    optimizedReviews: stats.optimizedReviews || 0,
    codeQualityAverage: stats.codeQualityAverage || 0,
    longestStreak: stats.longestStreak || 0,
    level: progress?.level || 1,
    patternsMastered: patterns.filter((p) => (p.mastery || 0) >= 70).length,
    problemsSolved: progress?.practice?.solvedQuestions?.length || 0
  };
}

/**
 * Evaluate achievements against a UserProgress document, granting any newly
 * earned badges (mutates progress.badges). Does NOT save — the caller persists.
 *
 * @returns {Array<{id,name,description,icon,rarity}>} newly earned achievements
 */
function evaluateAchievements(progress) {
  if (!progress) return [];
  if (!Array.isArray(progress.badges)) progress.badges = [];

  const earnedIds = new Set(progress.badges.map((b) => b.badgeId));
  const ctx = buildContext(progress);
  const newlyEarned = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedIds.has(achievement.id)) continue;
    if (achievement.test(ctx)) {
      progress.badges.push({
        badgeId: achievement.id,
        name: achievement.name,
        earnedAt: new Date()
      });
      newlyEarned.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity
      });
    }
  }

  if (newlyEarned.length > 0 && typeof progress.markModified === 'function') {
    progress.markModified('badges');
  }

  return newlyEarned;
}

/**
 * Persist notifications for newly-earned achievements. Best-effort.
 */
async function createAchievementNotifications(userId, earned = []) {
  if (!userId || earned.length === 0) return;

  try {
    await Notification.insertMany(
      earned.map((achievement) => ({
        user: userId,
        type: 'achievement',
        title: `Achievement unlocked: ${achievement.name}`,
        message: achievement.description,
        icon: 'achievement',
        link: '/profile',
        priority: 'normal',
        data: { badgeId: achievement.id, rarity: achievement.rarity }
      }))
    );
  } catch (error) {
    // Notifications are non-critical; never block the main flow.
    console.error('Failed to create achievement notifications:', error.message);
  }
}

/**
 * Public catalog (no test fns) — useful for an endpoint or client mirroring.
 */
function getCatalog() {
  return ACHIEVEMENTS.map(({ id, name, description, icon, rarity }) => ({
    id,
    name,
    description,
    icon,
    rarity
  }));
}

module.exports = {
  evaluateAchievements,
  createAchievementNotifications,
  getCatalog,
  ACHIEVEMENT_BY_ID
};
