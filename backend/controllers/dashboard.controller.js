const { UserProgress, CodeReview, Leaderboard, Notification, DSAPattern } = require('../models');
const { subscriptionService, roadmapCoachService } = require('../services');
const { errorHandler } = require('../utils');

// ⚡ OPTIMIZED: Advanced in-memory response cache with LRU eviction
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
const MAX_CACHE_SIZE = 500; // Increased from 100
const CACHE_STATS = { hits: 0, misses: 0, evictions: 0 };
const PRACTICE_POINTS_BY_DIFFICULTY = {
  Easy: 10,
  Medium: 20,
  Hard: 35
};
const ROADMAP_FULL_ACCESS_PLANS = new Set(['pro', 'team', 'enterprise']);

const hasRoadmapFullAccess = (subscription) => (
  Boolean(subscription?.features?.hasAdvancedAI) ||
  ROADMAP_FULL_ACCESS_PLANS.has(subscription?.plan)
);

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
        .select('finalScore rankChange')
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

    let computedRank = 0;
    if (leaderboard?.finalScore !== undefined) {
      computedRank = (await Leaderboard.countDocuments({
        period: 'all-time',
        finalScore: { $gt: leaderboard.finalScore }
      })) + 1;
    }

    return {
      totalReviews: progress.stats?.totalReviews || 0,
      optimizedReviews: progress.stats?.optimizedReviews || 0,
      averageImprovement: progress.stats?.averageImprovement || 0,
      currentStreak: progress.stats?.currentStreak || 0,
      level: progress.level || 1,
      experience: progress.experience || 0,
      experienceToNextLevel: progress.experienceToNextLevel || 100,
      rank: computedRank || 0,
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
      createdAt: review.createdAt,
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
        reviews: 0,
        solved: 0,
        total: pattern.totalProblems || 10,
        emoji: pattern.emoji || '🧠',
        color: getPatternColor(pattern.name)
      }));
    }

    return progress.patterns.slice(0, 4).map(p => ({
      name: p.pattern?.name || 'Unknown',
      mastery: Math.round(p.mastery || 0),
      reviews: p.problemsSolved || 0,
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

// Get solved DSA practice questions for the current user
exports.getPracticeProgress = errorHandler(async (req, res) => {
  const progress = await getOrCreateUserProgress(req.user._id);
  const solvedQuestions = progress.practice?.solvedQuestions || [];

  res.status(200).json({
    success: true,
    data: {
      solvedQuestions,
      solvedIds: solvedQuestions.map((question) => question.questionId),
      totalSolved: solvedQuestions.length,
      totalPoints: progress.practice?.totalPoints || 0
    }
  });
});

// Toggle a DSA practice question as solved/unsolved and refresh leaderboard points
exports.updatePracticeProgress = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const { questionId } = req.params;
  const { solved = true, question = {} } = req.body || {};
  const safeQuestion = question && typeof question === 'object' ? question : {};

  if (!questionId || questionId.length > 120) {
    return res.status(400).json({
      success: false,
      message: 'Invalid question id'
    });
  }

  const progress = await getOrCreateUserProgress(userId);
  if (!progress.practice) {
    progress.practice = { solvedQuestions: [], totalPoints: 0 };
  }
  if (!Array.isArray(progress.practice.solvedQuestions)) {
    progress.practice.solvedQuestions = [];
  }

  const existingIndex = progress.practice.solvedQuestions.findIndex(
    (item) => item.questionId === questionId
  );
  const wasSolved = existingIndex >= 0;
  let pointsDelta = 0;

  if (solved && !wasSolved) {
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(safeQuestion.difficulty)
      ? safeQuestion.difficulty
      : 'Medium';
    const points = PRACTICE_POINTS_BY_DIFFICULTY[difficulty];

    progress.practice.solvedQuestions.push({
      questionId,
      title: String(safeQuestion.title || '').slice(0, 180),
      platform: String(safeQuestion.platform || '').slice(0, 40),
      patternName: String(safeQuestion.patternName || '').slice(0, 80),
      difficulty,
      points,
      solvedAt: new Date()
    });
    progress.practice.totalPoints = (progress.practice.totalPoints || 0) + points;
    progress.practice.lastSolvedAt = new Date();
    progress.addExperience(Math.max(5, Math.round(points / 2)));
    progress.updateStreak();
    pointsDelta = points;
  } else if (!solved && wasSolved) {
    const [removed] = progress.practice.solvedQuestions.splice(existingIndex, 1);
    const removedPoints = removed?.points || 0;
    progress.practice.totalPoints = Math.max(0, (progress.practice.totalPoints || 0) - removedPoints);
    pointsDelta = -removedPoints;
  }

  roadmapCoachService.invalidateRoadmapCoach(progress);
  await progress.save();

  const leaderboardUpdate = await refreshPracticeLeaderboard(userId, progress);
  invalidateCache(`stats:${userId}`);
  invalidateCache(`patterns:${userId}`);
  invalidateCache(`leaderboard:`);

  const solvedQuestions = progress.practice?.solvedQuestions || [];
  res.status(200).json({
    success: true,
    data: {
      solvedQuestions,
      solvedIds: solvedQuestions.map((item) => item.questionId),
      totalSolved: solvedQuestions.length,
      totalPoints: progress.practice?.totalPoints || 0,
      pointsDelta,
      scoreChange: leaderboardUpdate.scoreChange,
      finalScore: leaderboardUpdate.finalScore,
      rank: leaderboardUpdate.rank
    }
  });
});

// Get leaderboard (⚡⚡⚡ ULTRA-OPTIMIZED with pagination, caching, and minimal payload)
// Get Review-to-Roadmap AI Coach recommendations
exports.getRoadmapCoach = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const subscription = await subscriptionService.getUserSubscription(userId);
  const hasFullAccess = hasRoadmapFullAccess(subscription);
  const roadmap = await roadmapCoachService.getRoadmapCoach(userId, {
    includeAI: hasFullAccess
  });

  res.status(200).json({
    success: true,
    data: roadmapCoachService.formatRoadmapForAccess(roadmap, hasFullAccess)
  });
});

// Force-refresh roadmap copy for paid users; starter users receive the locked preview
exports.refreshRoadmapCoach = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const subscription = await subscriptionService.getUserSubscription(userId);
  const hasFullAccess = hasRoadmapFullAccess(subscription);
  const roadmap = await roadmapCoachService.getRoadmapCoach(userId, {
    includeAI: hasFullAccess,
    forceRefresh: hasFullAccess
  });

  res.status(200).json({
    success: true,
    data: roadmapCoachService.formatRoadmapForAccess(roadmap, hasFullAccess)
  });
});

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
    await recalculatePracticeLeaderboard(period);

    const [totalCount, leaderboardData, currentUserEntry] = await Promise.all([
      // Always count for proper pagination
      Leaderboard.countDocuments({ period }),
      // ⚡ OPTIMIZATION 2: Minimal field selection + lean for speed
      Leaderboard.find({ period })
        .populate('user', 'name profilePhoto') // Only get name and profilePhoto, not entire user object
        .select('finalScore score rankChange user') // Only fields we need
        .sort({ finalScore: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean() // Convert to plain JS objects (faster)
        .maxTimeMS(3000), // Shorter timeout for faster fails
      // Get current user's position
      Leaderboard.findOne({ user: userId, period })
        .select('finalScore score rankChange')
        .lean()
    ]);
    
    console.log(`✅ Fetched ${leaderboardData.length} users (Total: ${totalCount}, HasMore: ${skip + leaderboardData.length < totalCount})`);

    // Lazy backfill for legacy rows that don't yet have hybrid scores
    const needsBackfill = leaderboardData.filter((entry) => {
      const fs = Number(entry.finalScore ?? 0);
      const legacy = Number(entry.score ?? 0);
      return fs <= 0 && legacy <= 0 && entry.user?._id;
    });

    if (needsBackfill.length > 0) {
      const userIdsNeedingBackfill = needsBackfill.map((entry) => entry.user._id);
      const progressRows = await UserProgress.find({ user: { $in: userIdsNeedingBackfill } })
        .select('user stats level practice')
        .lean();

      const progressMap = new Map(
        progressRows.map((row) => [row.user.toString(), row])
      );

      const bulkOps = [];
      for (const entry of needsBackfill) {
        const userIdStr = entry.user._id.toString();
        const progress = progressMap.get(userIdStr);
        if (!progress) continue;

        const finalScore = progress.practice?.totalPoints || 0;

        entry.rating = 0;
        entry.contributionScore = finalScore;
        entry.finalScore = finalScore;
        entry.score = finalScore;

        bulkOps.push({
          updateOne: {
            filter: { _id: entry._id },
            update: {
              $set: {
                rating: 0,
                contributionScore: finalScore,
                finalScore,
                score: finalScore,
                lastUpdated: new Date()
              }
            }
          }
        });
      }

      if (bulkOps.length > 0) {
        await Leaderboard.bulkWrite(bulkOps, { ordered: false });
      }
    }

    // ⚡ OPTIMIZATION 3: Faster array mapping with pre-sized array
    const formatted = new Array(leaderboardData.length);
    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      const isCurrentUser = entry.user?._id?.toString() === userId.toString();
      formatted[i] = {
        rank: skip + i + 1,
        name: entry.user?.name || 'Anonymous',
        score: entry.finalScore ?? entry.score ?? 0,
        avatar: getAvatar(entry.user?.name, i),
        profilePhoto: entry.user?.profilePhoto || null, // Add this line
        change: entry.rankChange > 0 ? `+${entry.rankChange}` : entry.rankChange < 0 ? `${entry.rankChange}` : '',
        highlight: isCurrentUser
      };
    }

    // If current user is not in visible range, add them at the end
    if (currentUserEntry && !formatted.some(e => e.highlight) && limit <= 50) {
      const currentUserRank = (await Leaderboard.countDocuments({
        period,
        finalScore: { $gt: (currentUserEntry.finalScore ?? currentUserEntry.score ?? 0) }
      })) + 1;

      formatted.push({
        rank: currentUserRank,
        name: 'you',
        score: currentUserEntry.finalScore ?? currentUserEntry.score ?? 0,
        avatar: '⭐',
        profilePhoto: req.user?.profilePhoto || null, // Add this line
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

async function getOrCreateUserProgress(userId) {
  let progress = await UserProgress.findOne({ user: userId });

  if (!progress) {
    progress = await UserProgress.create({
      user: userId,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      practice: {
        solvedQuestions: [],
        totalPoints: 0
      }
    });
  }

  if (!progress.practice) {
    progress.practice = { solvedQuestions: [], totalPoints: 0 };
  }

  return progress;
}

async function refreshPracticeLeaderboard(userId, progress) {
  let leaderboardEntry = await Leaderboard.findOne({ user: userId, period: 'all-time' });

  if (!leaderboardEntry) {
    leaderboardEntry = await Leaderboard.create({
      user: userId,
      rating: 0,
      contributionScore: 0,
      finalScore: 0,
      gamesPlayed: 0,
      score: 0,
      rank: 0,
      period: 'all-time'
    });
  }

  const previousFinalScore = Number(leaderboardEntry.finalScore ?? leaderboardEntry.score ?? 0);
  const finalScore = progress.practice?.totalPoints || 0;
  const oldRank = Number(leaderboardEntry.rank || 0);
  const currentRank = (await Leaderboard.countDocuments({
    period: 'all-time',
    finalScore: { $gt: finalScore }
  })) + 1;

  leaderboardEntry.rating = 0;
  leaderboardEntry.contributionScore = finalScore;
  leaderboardEntry.finalScore = finalScore;
  leaderboardEntry.score = finalScore;
  leaderboardEntry.stats = {
    ...(leaderboardEntry.stats || {}),
    totalReviews: progress.stats?.totalReviews || 0,
    averageImprovement: progress.stats?.averageImprovement || 0,
    level: progress.level || 1,
    streak: progress.stats?.currentStreak || 0,
    practiceProblemsSolved: progress.practice?.solvedQuestions?.length || 0,
    practicePoints: progress.practice?.totalPoints || 0
  };
  leaderboardEntry.previousRank = oldRank;
  leaderboardEntry.rank = currentRank;
  leaderboardEntry.rankChange = oldRank ? (oldRank - currentRank) : 0;
  leaderboardEntry.lastUpdated = new Date();
  await leaderboardEntry.save();

  return {
    finalScore,
    scoreChange: finalScore - previousFinalScore,
    rank: currentRank
  };
}

async function recalculatePracticeLeaderboard(period = 'all-time') {
  const entries = await Leaderboard.find({ period }).select('_id user').lean();
  if (entries.length === 0) return;

  const progressRows = await UserProgress.find({
    user: { $in: entries.map((entry) => entry.user) }
  }).select('user practice').lean();
  const progressByUser = new Map(
    progressRows.map((progress) => [progress.user.toString(), progress])
  );

  const bulkOps = entries.map((entry) => {
    const progress = progressByUser.get(entry.user.toString());
    const finalScore = progress?.practice?.totalPoints || 0;

    return {
      updateOne: {
        filter: { _id: entry._id },
        update: {
          $set: {
            rating: 0,
            contributionScore: finalScore,
            finalScore,
            score: finalScore,
            'stats.practiceProblemsSolved': progress?.practice?.solvedQuestions?.length || 0,
            'stats.practicePoints': finalScore,
            lastUpdated: new Date()
          }
        }
      }
    };
  });

  if (bulkOps.length > 0) {
    await Leaderboard.bulkWrite(bulkOps, { ordered: false });
  }
}

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

