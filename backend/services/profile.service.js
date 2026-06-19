/**
 * Profile service.
 *
 * Assembles a user's public-facing profile from the User document plus their
 * gamification progress (UserProgress), subscription, and leaderboard rank.
 * Exposes an owner view (full) and a public view (privacy-aware).
 */

const { User, UserProgress, Subscription, Leaderboard, CodeReview } = require('../models');
const { ApiError, NotFoundError, ConflictError } = require('../utils/errorHandler');
const { isValidUsername } = require('../utils/username');
const authService = require('./auth.service');

const PATTERN_LIMIT = 6;
const RECENT_REVIEWS_LIMIT = 5;

const PUBLIC_USER_FIELDS =
  'name username headline bio location links preferredLanguages goal profilePhoto visibility createdAt';

// ── Helpers ──────────────────────────────────────────────────────────────

function buildStats(progress) {
  const stats = progress?.stats || {};
  return {
    level: progress?.level || 1,
    experience: progress?.experience || 0,
    experienceToNextLevel: progress?.experienceToNextLevel || 100,
    totalReviews: stats.totalReviews || 0,
    optimizedReviews: stats.optimizedReviews || 0,
    averageImprovement: Math.round(stats.averageImprovement || 0),
    codeQualityAverage: Math.round(stats.codeQualityAverage || 0),
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0,
    practicePoints: progress?.practice?.totalPoints || 0,
    problemsSolved: progress?.practice?.solvedQuestions?.length || 0
  };
}

function buildPatterns(progress) {
  const patterns = progress?.patterns || [];
  return patterns
    .filter((item) => item.pattern)
    .sort((a, b) => (b.mastery || 0) - (a.mastery || 0))
    .slice(0, PATTERN_LIMIT)
    .map((item) => ({
      name: item.pattern?.name || 'Unknown',
      emoji: item.pattern?.emoji || '',
      mastery: Math.round(item.mastery || 0),
      problemsSolved: item.problemsSolved || 0,
      total: item.pattern?.totalProblems || 10
    }));
}

function buildBadges(progress) {
  return (progress?.badges || []).map((badge) => ({
    badgeId: badge.badgeId,
    name: badge.name,
    earnedAt: badge.earnedAt
  }));
}

async function computeRank(userId) {
  const entry = await Leaderboard.findOne({ user: userId, period: 'all-time' })
    .select('finalScore score rankChange')
    .lean();

  if (!entry) {
    return { global: 0, change: 0 };
  }

  const finalScore = entry.finalScore ?? entry.score ?? 0;
  const ahead = await Leaderboard.countDocuments({
    period: 'all-time',
    finalScore: { $gt: finalScore }
  });

  return { global: ahead + 1, change: entry.rankChange || 0 };
}

function formatRecentReviews(reviews) {
  return reviews.map((review) => ({
    id: review._id,
    title: review.title,
    language: review.language,
    status: review.status === 'completed' ? 'optimized' : review.status,
    complexityBefore: review.analysis?.timeComplexity?.before || null,
    complexityAfter: review.analysis?.timeComplexity?.after || null,
    improvement: Math.round(review.analysis?.improvementPercentage || 0),
    qualityScore: review.analysis?.codeQualityScore || null,
    createdAt: review.createdAt
  }));
}

async function loadProgress(userId) {
  return UserProgress.findOne({ user: userId })
    .populate('patterns.pattern', 'name emoji totalProblems')
    .lean();
}

// ── Owner view ───────────────────────────────────────────────────────────

async function getOwnProfile(userId) {
  const [user, progress, rank, subscription] = await Promise.all([
    User.findById(userId).select(`${PUBLIC_USER_FIELDS} email`).lean(),
    loadProgress(userId),
    computeRank(userId),
    Subscription.findOne({ user: userId }).select('plan status').lean()
  ]);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const recentReviews = await CodeReview.find({ user: userId, status: 'completed' })
    .select('title language analysis.timeComplexity analysis.improvementPercentage analysis.codeQualityScore status createdAt')
    .sort({ createdAt: -1 })
    .limit(RECENT_REVIEWS_LIMIT)
    .lean();

  return {
    isOwner: true,
    user: {
      id: user._id,
      name: user.name,
      username: user.username || null,
      email: user.email,
      headline: user.headline || '',
      bio: user.bio || '',
      location: user.location || '',
      links: user.links || {},
      preferredLanguages: user.preferredLanguages || [],
      goal: user.goal || '',
      profilePhoto: user.profilePhoto || null,
      visibility: user.visibility || { isPublic: true, showActivity: true, showReviews: true },
      memberSince: user.createdAt
    },
    stats: buildStats(progress),
    rank,
    patterns: buildPatterns(progress),
    badges: buildBadges(progress),
    subscription: subscription ? { plan: subscription.plan, status: subscription.status } : { plan: 'starter', status: 'active' },
    recentReviews: formatRecentReviews(recentReviews)
  };
}

// ── Public view ──────────────────────────────────────────────────────────

async function getPublicProfile(username) {
  const normalized = String(username || '').toLowerCase().trim();
  const user = await User.findOne({ username: normalized }).select(PUBLIC_USER_FIELDS).lean();

  // Return 404 for both "missing" and "private" so we don't leak existence.
  if (!user || user.visibility?.isPublic === false) {
    throw new NotFoundError('Profile not found');
  }

  const showActivity = user.visibility?.showActivity !== false;
  const showReviews = user.visibility?.showReviews !== false;

  const [progress, rank, subscription] = await Promise.all([
    loadProgress(user._id),
    computeRank(user._id),
    Subscription.findOne({ user: user._id }).select('plan').lean()
  ]);

  let recentReviews = [];
  if (showReviews) {
    const reviews = await CodeReview.find({ user: user._id, status: 'completed', isPublic: true })
      .select('title language analysis.timeComplexity analysis.improvementPercentage analysis.codeQualityScore status createdAt')
      .sort({ createdAt: -1 })
      .limit(RECENT_REVIEWS_LIMIT)
      .lean();
    recentReviews = formatRecentReviews(reviews);
  }

  return {
    isOwner: false,
    user: {
      name: user.name,
      username: user.username,
      headline: user.headline || '',
      bio: user.bio || '',
      location: user.location || '',
      links: user.links || {},
      preferredLanguages: user.preferredLanguages || [],
      goal: user.goal || '',
      profilePhoto: user.profilePhoto || null,
      memberSince: user.createdAt
    },
    stats: showActivity ? buildStats(progress) : null,
    rank: showActivity ? rank : null,
    patterns: showActivity ? buildPatterns(progress) : [],
    badges: buildBadges(progress),
    subscription: { plan: subscription?.plan || 'starter' },
    recentReviews
  };
}

// ── Update ───────────────────────────────────────────────────────────────

const TEXT_FIELDS = ['name', 'headline', 'bio', 'location', 'goal'];
const LINK_FIELDS = ['github', 'linkedin', 'website', 'twitter'];
const VISIBILITY_FIELDS = ['isPublic', 'showActivity', 'showReviews'];

async function isUsernameAvailable(username, excludeUserId) {
  const normalized = String(username || '').toLowerCase().trim();
  if (!isValidUsername(normalized)) {
    return { available: false, reason: 'invalid' };
  }
  const query = { username: normalized };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const exists = await User.exists(query);
  return { available: !exists, reason: exists ? 'taken' : 'available', username: normalized };
}

async function updateProfile(userId, payload = {}) {
  const update = {};

  // Whitelisted text fields
  for (const field of TEXT_FIELDS) {
    if (typeof payload[field] === 'string') {
      update[field] = payload[field].trim();
    }
  }

  // Links (nested, dot-path so we don't clobber other links)
  if (payload.links && typeof payload.links === 'object') {
    for (const field of LINK_FIELDS) {
      if (typeof payload.links[field] === 'string') {
        update[`links.${field}`] = payload.links[field].trim();
      }
    }
  }

  // Visibility toggles
  if (payload.visibility && typeof payload.visibility === 'object') {
    for (const field of VISIBILITY_FIELDS) {
      if (typeof payload.visibility[field] === 'boolean') {
        update[`visibility.${field}`] = payload.visibility[field];
      }
    }
  }

  // Preferred languages (array of short strings)
  if (Array.isArray(payload.preferredLanguages)) {
    update.preferredLanguages = payload.preferredLanguages
      .filter((lang) => typeof lang === 'string' && lang.trim())
      .map((lang) => lang.trim().slice(0, 30))
      .slice(0, 12);
  }

  // Username change (validated + uniqueness checked)
  if (typeof payload.username === 'string') {
    const normalized = payload.username.toLowerCase().trim();
    if (!isValidUsername(normalized)) {
      throw new ApiError(400, 'Username must be 3-30 characters and use only lowercase letters, numbers, and underscores');
    }
    const taken = await User.exists({ username: normalized, _id: { $ne: userId } });
    if (taken) {
      throw new ConflictError('That username is already taken');
    }
    update.username = normalized;
  }

  if (Object.keys(update).length === 0) {
    // Nothing to change — return the current profile rather than erroring.
    return getOwnProfile(userId);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true, context: 'query' }
  ).lean();

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Identity fields are cached in auth.service — clear so /auth/me stays fresh.
  authService.clearUserCache(user.email, userId);

  return getOwnProfile(userId);
}

module.exports = {
  getOwnProfile,
  getPublicProfile,
  updateProfile,
  isUsernameAvailable
};
