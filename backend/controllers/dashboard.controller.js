const { UserProgress, CodeReview, Leaderboard, Notification, DSAPattern } = require('../models');
const { errorHandler } = require('../utils');

// ⚡ OPTIMIZATION: Simple in-memory response cache
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Cache helper
const getCachedOrFetch = async (key, fetchFn) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  responseCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old cache entries (keep max 100 entries)
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  
  return data;
};

// Get user progress
exports.getUserProgress = errorHandler(async (req, res) => {
  let progress = await UserProgress.findOne({ user: req.user._id })
    .populate('patterns.pattern', 'name emoji')
    .lean();

  // Create progress if doesn't exist
  if (!progress) {
    progress = await UserProgress.create({
      user: req.user._id,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    });
  }

  res.status(200).json({
    success: true,
    data: progress
  });
});

// Get dashboard stats (⚡ optimized with caching)
exports.getDashboardStats = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const cacheKey = `stats:${userId}`;

  const stats = await getCachedOrFetch(cacheKey, async () => {
    // ⚡ Fetch progress and leaderboard in parallel
    const [progress, leaderboard] = await Promise.all([
      UserProgress.findOne({ user: userId })
        .select('stats level experience experienceToNextLevel')
        .lean(),
      Leaderboard.findOne({ user: userId, period: 'all-time' })
        .select('rank rankChange')
        .lean()
    ]);

    // Create progress if doesn't exist
    if (!progress) {
      const newProgress = await UserProgress.create({
        user: userId,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        rank: { global: 0 }
      });
      
      return {
        totalReviews: 0,
        optimizedReviews: 0,
        averageImprovement: 0,
        currentStreak: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        rank: 0,
        rankChange: 0
      };
    }

    return {
      totalReviews: progress.stats?.totalReviews || 0,
      optimizedReviews: progress.stats?.optimizedReviews || 0,
      averageImprovement: progress.stats?.averageImprovement || 0,
      currentStreak: progress.stats?.currentStreak || 0,
      level: progress.level || 1,
      experience: progress.experience || 0,
      experienceToNextLevel: progress.experienceToNextLevel || 100,
      rank: leaderboard?.rank || 0,
      rankChange: leaderboard?.rankChange || 0
    };
  });

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Get recent reviews (⚡ optimized with caching)
exports.getRecentReviews = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 3;
  const cacheKey = `reviews:${userId}:${limit}`;

  const formattedReviews = await getCachedOrFetch(cacheKey, async () => {
    const reviews = await CodeReview.find({ user: userId })
      .select('title language lineCount analysis status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .maxTimeMS(5000); // Timeout after 5 seconds

    // Format for frontend
    return reviews.map((review) => ({
      id: review._id,
      title: review.title,
      language: review.language,
      complexity: review.analysis?.timeComplexity?.before || 'N/A',
      improved: review.analysis?.timeComplexity?.after || 'N/A',
      status: review.status === 'completed' ? 'optimized' : review.status,
      improvement: review.analysis?.improvementPercentage ? `${Math.round(review.analysis.improvementPercentage)}%` : '0%',
      date: getRelativeTime(review.createdAt),
      lines: review.lineCount
    }));
  });

  res.status(200).json({
    success: true,
    data: formattedReviews
  });
});

// Get pattern progress (⚡ optimized with caching)
exports.getPatternProgress = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const cacheKey = `patterns:${userId}`;

  const formattedPatterns = await getCachedOrFetch(cacheKey, async () => {
    const progress = await UserProgress.findOne({ user: userId })
      .populate('patterns.pattern', 'name emoji totalProblems')
      .select('patterns')
      .lean()
      .maxTimeMS(5000);

    if (!progress || !progress.patterns || progress.patterns.length === 0) {
      // Return default patterns if no progress yet
      const defaultPatterns = await DSAPattern.find({ isActive: true })
        .select('name emoji totalProblems')
        .limit(4)
        .lean();

      return defaultPatterns.map(pattern => ({
        name: pattern.name,
        mastery: 0,
        solved: 0,
        total: pattern.totalProblems || 10,
        emoji: pattern.emoji || '🧠',
        color: getPatternColor(pattern.name)
      }));
    }

    return progress.patterns.slice(0, 4).map(p => ({
      name: p.pattern?.name || 'Unknown',
      mastery: Math.round(p.mastery || 0),
      solved: p.problemsSolved || 0,
      total: p.pattern?.totalProblems || 10,
      emoji: p.pattern?.emoji || '🧠',
      color: getPatternColor(p.pattern?.name)
    }));
  });

  res.status(200).json({
    success: true,
    data: formattedPatterns
  });
});

// Get leaderboard (⚡ optimized with caching)
exports.getLeaderboard = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 5;
  const period = req.query.period || 'all-time';
  const cacheKey = `leaderboard:${period}:${limit}:${userId}`;

  const formattedLeaderboard = await getCachedOrFetch(cacheKey, async () => {
    // ⚡ Fetch leaderboard and current user in parallel
    const [leaderboardData, currentUserEntry] = await Promise.all([
      Leaderboard.find({ period })
        .populate('user', 'name')
        .select('rank score rankChange user')
        .sort({ rank: 1 })
        .limit(limit)
        .lean()
        .maxTimeMS(5000),
      Leaderboard.findOne({ user: userId, period })
        .select('rank score rankChange')
        .lean()
    ]);

    const formatted = leaderboardData.map((entry, index) => ({
      rank: entry.rank || (index + 1),
      name: entry.user?.name || 'Anonymous',
      score: entry.score || 0,
      avatar: getAvatar(entry.user?.name, index),
      change: entry.rankChange > 0 ? `+${entry.rankChange}` : entry.rankChange < 0 ? `${entry.rankChange}` : '',
      highlight: entry.user?._id?.toString() === userId.toString()
    }));

    // If current user is not in top 5, add them
    if (currentUserEntry && !formatted.some(e => e.highlight)) {
      formatted.push({
        rank: currentUserEntry.rank,
        name: 'you',
        score: currentUserEntry.score,
        avatar: '⭐',
        change: currentUserEntry.rankChange > 0 ? `+${currentUserEntry.rankChange}` : currentUserEntry.rankChange < 0 ? `${currentUserEntry.rankChange}` : '',
        highlight: true
      });
    }

    return formatted;
  });

  res.status(200).json({
    success: true,
    data: formattedLeaderboard
  });
});

// Get notifications
exports.getNotifications = errorHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ 
    user: req.user._id, 
    isRead: false 
  });

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
});

// Mark notification as read
exports.markNotificationRead = errorHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// Helper functions
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getPatternColor(name) {
  const colors = {
    'Sliding Window': 'from-blue-500 to-cyan-500',
    'Two Pointers': 'from-purple-500 to-pink-500',
    'Binary Search': 'from-emerald-500 to-green-500',
    'Dynamic Programming': 'from-orange-500 to-red-500',
    'default': 'from-gray-500 to-gray-600'
  };
  return colors[name] || colors.default;
}

function getAvatar(name, index) {
  const avatars = ['🚀', '⭐', '🥷', '👨‍💻', '👑', '💎', '🎯', '🔥', '⚡', '🌟'];
  return avatars[index] || '👤';
}

