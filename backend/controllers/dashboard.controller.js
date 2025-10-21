const { UserProgress, CodeReview, Leaderboard, Notification, DSAPattern } = require('../models');
const { errorHandler } = require('../utils');

// ⚡ OPTIMIZED: Advanced in-memory response cache with LRU eviction
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
const MAX_CACHE_SIZE = 500; // Increased from 100
const CACHE_STATS = { hits: 0, misses: 0, evictions: 0 };

// ⚡ Cache helper with LRU (Least Recently Used) eviction
const getCachedOrFetch = async (key, fetchFn, customTTL = CACHE_TTL) => {
  const cached = responseCache.get(key);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < customTTL) {
    // Cache hit - move to end (LRU)
    CACHE_STATS.hits++;
    responseCache.delete(key);
    responseCache.set(key, cached);
    return cached.data;
  }
  
  // Cache miss - fetch fresh data
  CACHE_STATS.misses++;
  
  const data = await fetchFn();
  responseCache.set(key, { data, timestamp: now });
  
  // ⚡ LRU eviction: Remove oldest entries when cache is full
  if (responseCache.size > MAX_CACHE_SIZE) {
    const entriesToRemove = responseCache.size - MAX_CACHE_SIZE;
    const iterator = responseCache.keys();
    
    for (let i = 0; i < entriesToRemove; i++) {
      const oldestKey = iterator.next().value;
      responseCache.delete(oldestKey);
      CACHE_STATS.evictions++;
    }
  }
  
  return data;
};

// ⚡ Invalidate cache by pattern (useful for updates)
const invalidateCache = (pattern) => {
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
};

// ⚡ Cleanup stale cache entries periodically (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 2) { // Remove entries older than 2x TTL
      responseCache.delete(key);
    }
  }
}, 60000);

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

    // Format for frontend with premium details
    return reviews.map((review) => ({
      id: review._id,
      title: review.title,
      language: review.language,
      complexity: review.analysis?.timeComplexity?.before || 'N/A',
      improved: review.analysis?.timeComplexity?.after || 'N/A',
      status: review.status === 'completed' ? 'optimized' : review.status,
      improvement: review.analysis?.improvementPercentage ? `${Math.round(review.analysis.improvementPercentage)}%` : '0%',
      date: getRelativeTime(review.createdAt),
      lines: review.lineCount,
      // Premium analysis fields
      qualityScore: review.analysis?.codeQualityScore || review.analysis?.qualityBreakdown?.codeQuality?.score || null,
      readabilityScore: review.analysis?.readabilityScore || review.analysis?.qualityBreakdown?.readability?.score || null,
      suggestionsCount: review.analysis?.optimizationSuggestions?.length || 0,
      securityIssuesCount: review.analysis?.securityConcerns?.length || 0,
      patternsDetected: review.analysis?.detectedPatterns?.length || 0,
      speedup: review.analysis?.performanceMetrics?.estimatedSpeedup || null
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

// Get leaderboard (⚡⚡⚡ ULTRA-OPTIMIZED with pagination, caching, and minimal payload)
exports.getLeaderboard = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  const period = req.query.period || 'all-time';
  const skip = (page - 1) * limit;
  const cacheKey = `leaderboard:${period}:${limit}:${page}:${userId}`;

  const result = await getCachedOrFetch(cacheKey, async () => {
    console.log(`📊 Leaderboard request - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    
    // ⚡ OPTIMIZATION 1: Fetch total count, leaderboard, and current user in parallel
    const [totalCount, leaderboardData, currentUserEntry] = await Promise.all([
      // Always count for proper pagination
      Leaderboard.countDocuments({ period }),
      // ⚡ OPTIMIZATION 2: Minimal field selection + lean for speed
      Leaderboard.find({ period })
        .populate('user', 'name') // Only get name, not entire user object
        .select('rank score rankChange user') // Only fields we need
        .sort({ rank: 1 })
        .skip(skip)
        .limit(limit)
        .lean() // Convert to plain JS objects (faster)
        .maxTimeMS(3000), // Shorter timeout for faster fails
      // Get current user's position
      Leaderboard.findOne({ user: userId, period })
        .select('rank score rankChange')
        .lean()
    ]);
    
    console.log(`✅ Fetched ${leaderboardData.length} users (Total: ${totalCount}, HasMore: ${skip + leaderboardData.length < totalCount})`);

    // ⚡ OPTIMIZATION 3: Faster array mapping with pre-sized array
    const formatted = new Array(leaderboardData.length);
    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      const isCurrentUser = entry.user?._id?.toString() === userId.toString();
      formatted[i] = {
        rank: entry.rank || (skip + i + 1),
        name: entry.user?.name || 'Anonymous',
        score: entry.score || 0,
        avatar: getAvatar(entry.user?.name, i),
        change: entry.rankChange > 0 ? `+${entry.rankChange}` : entry.rankChange < 0 ? `${entry.rankChange}` : '',
        highlight: isCurrentUser
      };
    }

    // If current user is not in visible range, add them at the end
    if (currentUserEntry && !formatted.some(e => e.highlight) && limit <= 50) {
      formatted.push({
        rank: currentUserEntry.rank,
        name: 'you',
        score: currentUserEntry.score,
        avatar: '⭐',
        change: currentUserEntry.rankChange > 0 ? `+${currentUserEntry.rankChange}` : currentUserEntry.rankChange < 0 ? `${currentUserEntry.rankChange}` : '',
        highlight: true
      });
    }

    return {
      data: formatted,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: skip + leaderboardData.length < totalCount
      }
    };
  }, 60000); // ⚡ OPTIMIZATION 4: Longer cache (60s) for leaderboard since it doesn't change often

  // ⚡ OPTIMIZATION 5: Add cache headers for browser caching (30 seconds)
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  
  res.status(200).json({
    success: true,
    ...result
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

// ⚡ Export cache invalidation function for external use
exports.invalidateUserCache = (userId) => {
  invalidateCache(`stats:${userId}`);
  invalidateCache(`reviews:${userId}`);
  invalidateCache(`patterns:${userId}`);
  invalidateCache(`leaderboard:`); // Invalidate all leaderboard caches
};

// ⚡ Get cache statistics (useful for monitoring)
exports.getCacheStats = () => {
  return {
    size: responseCache.size,
    maxSize: MAX_CACHE_SIZE,
    stats: CACHE_STATS,
    ttl: CACHE_TTL
  };
};

