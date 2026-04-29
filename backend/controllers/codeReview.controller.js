const { CodeReview, UserProgress, Leaderboard, Activity, Notification } = require('../models');
const { errorHandler } = require('../utils');
const aiService = require('../services/ai.service');
const subscriptionService = require('../services/subscription.service');
const {
  BASELINE_RATING,
  computeContributionScore,
  updateRating,
  computeFinalScore,
  computeNormalizedCodeHash,
  determineMatchOutcome
} = require('../services/leaderboard.service');

/**
 * Deep parse JSON - recursively parse stringified JSON
 * Handles cases where AI returns nested stringified JSON
 */
function deepParseJSON(obj) {
  if (typeof obj === 'string') {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(obj);
      return deepParseJSON(parsed); // Recursively parse
    } catch (e) {
      // Not JSON, return as is
      return obj;
    }
  } else if (Array.isArray(obj)) {
    return obj.map(item => deepParseJSON(item));
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deepParseJSON(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

/**
 * Ensure value is an array, handling stringified arrays
 * This is ULTRA aggressive to handle AI responses that may be deeply nested strings
 * Handles edge case: ["[{...}, {...}]"] -> [{...}, {...}]
 */
function ensureArray(value) {
  if (!value) return [];
  
  // If it's already an array, deep parse each element
  if (Array.isArray(value)) {
    const parsed = value.map(item => deepParseJSON(item));
    
    // CRITICAL: Check if we have an array with a single element that's also an array
    // This happens when AI returns: ["[{...}, {...}]"] instead of [{...}, {...}]
    if (parsed.length === 1 && Array.isArray(parsed[0])) {
      console.log('🔥 Detected nested array! Flattening...');
      return parsed[0].map(item => deepParseJSON(item)); // Flatten and re-parse
    }
    
    return parsed;
  }
  
  // If it's a string, try to parse it VERY aggressively
  if (typeof value === 'string') {
    try {
      // Try deep parsing first - this handles nested stringified JSON
      let parsedValue = deepParseJSON(value);
      
      // If deepParseJSON returned an array, we're good!
      if (Array.isArray(parsedValue)) {
        // Double-check for nested arrays here too
        if (parsedValue.length === 1 && Array.isArray(parsedValue[0])) {
          console.log('🔥 Detected nested array from string! Flattening...');
          return parsedValue[0].map(item => deepParseJSON(item));
        }
        return parsedValue.map(item => deepParseJSON(item));
      }
      
      // If it's still a string after deep parse, try one more time
      if (typeof parsedValue === 'string') {
        let cleanValue = parsedValue.trim().replace(/^['"]/, '').replace(/['"]$/, '');
        const secondParse = JSON.parse(cleanValue);
        if (Array.isArray(secondParse)) {
          return secondParse.map(item => deepParseJSON(item));
        }
        return [deepParseJSON(secondParse)];
      }
      
      // If it's an object, wrap it
      if (parsedValue && typeof parsedValue === 'object') {
        return [parsedValue];
      }
      
      return [];
    } catch (e) {
      console.warn('⚠️ Failed to parse array string:', e.message);
      console.warn('   Value type:', typeof value);
      console.warn('   Value preview:', value.substring?.(0, 150));
      return []; // Return empty array if parsing fails
    }
  }
  
  // Wrap single objects in array
  if (typeof value === 'object' && value !== null) {
    return [deepParseJSON(value)];
  }
  
  return [];
}

// Submit code for review
exports.submitCode = errorHandler(async (req, res) => {
  const { title, language, code, lineCount } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!title || !language || !code) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, language, and code'
    });
  }

  // Get or create subscription (handles new users automatically)
  const subscription = await subscriptionService.getUserSubscription(userId);
  
  // Check subscription limits
  if (!subscription.canCreateReview()) {
    return res.status(403).json({
      success: false,
      message: 'Review limit reached. Upgrade to Pro for unlimited reviews!',
      upgradeRequired: true,
      currentUsage: subscription.usage.codeReviewsUsed,
      limit: subscription.features.codeReviewsLimit
    });
  }

  // Create code review
  const review = await CodeReview.create({
    user: userId,
    title,
    language,
    code,
    lineCount: lineCount || code.split('\n').length,
    status: 'analyzing'
  });

  // ❌ DON'T increment usage here - only after successful analysis!
  // Process review asynchronously and pass subscription for usage increment
  processReview(review._id, subscription).catch(err => {
    console.error('Error processing review:', err);
  });

  res.status(201).json({
    success: true,
    message: 'Code submitted successfully! Analysis in progress...',
    data: {
      reviewId: review._id,
      status: 'analyzing'
    }
  });
});

// Get review status
exports.getReviewStatus = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const review = await CodeReview.findOne({ _id: id, user: userId })
    .select('status title language createdAt analysis')
    .lean();

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// Get full review details
exports.getReviewDetails = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const review = await CodeReview.findOne({ _id: id, user: userId }).lean();

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// AI-powered code analysis function
async function processReview(reviewId, subscription) {
  const startTime = Date.now();
  
  const review = await CodeReview.findById(reviewId);
  if (!review) return;

  // Declare updatedReview outside try block so it's accessible everywhere
  let updatedReview = null;

  try {
    // Perform AI analysis
    const analysisResult = await aiService.analyzeCode(
      review.code,
      review.language,
      review.title
    );

    // Extract analysis data and deep parse any stringified JSON
    let analysis = deepParseJSON(analysisResult.data);
    const processingTime = Date.now() - startTime;

    // Explicitly parse all array fields to ensure they're proper arrays
    let optimizationSuggestions = ensureArray(analysis.optimizationSuggestions);
    let detectedPatterns = ensureArray(analysis.detectedPatterns);
    let codeSmells = ensureArray(analysis.codeSmells);
    let securityConcerns = ensureArray(analysis.securityConcerns);
    let learningResources = ensureArray(analysis.learningResources);
    let nextSteps = ensureArray(analysis.nextSteps);

    // Log types for debugging
    console.log(`📊 After ensureArray:`);
    console.log(`  - codeSmells length: ${codeSmells.length}, first element type: ${typeof codeSmells[0]}`);
    if (codeSmells[0]) {
      console.log(`  - First element is array: ${Array.isArray(codeSmells[0])}`);
      console.log(`  - First element preview: ${JSON.stringify(codeSmells[0]).substring(0, 150)}`);
    }
    
    // Force convert to proper arrays using spread and Array.from
    const safeCodeSmells = Array.isArray(codeSmells) ? [...codeSmells] : [];
    const safePatterns = Array.isArray(detectedPatterns) ? [...detectedPatterns] : [];
    const safeSuggestions = Array.isArray(optimizationSuggestions) ? [...optimizationSuggestions] : [];
    const safeSecurity = Array.isArray(securityConcerns) ? [...securityConcerns] : [];
    const safeResources = Array.isArray(learningResources) ? [...learningResources] : [];
    const safeSteps = Array.isArray(nextSteps) ? [...nextSteps] : [];
    
    console.log(`✅ Final arrays - suggestions: ${safeSuggestions.length}, patterns: ${safePatterns.length}, smells: ${safeCodeSmells.length}`);
    console.log(`✅ First smell element type: ${typeof safeCodeSmells[0]}, is object: ${typeof safeCodeSmells[0] === 'object'}`);
    if (safeCodeSmells[0]) {
      console.log(`✅ First smell keys: ${Object.keys(safeCodeSmells[0]).join(', ')}`);
    }

    // Build analysis object as a PLAIN JavaScript object first
    const analysisData = {
      timeComplexity: analysis.timeComplexity || { before: 'O(n)', after: 'O(n)', improved: false },
      spaceComplexity: analysis.spaceComplexity || { before: 'O(1)', after: 'O(1)', improved: false },
      improvementPercentage: analysis.improvementPercentage || 50,
      performanceMetrics: analysis.performanceMetrics || null,
      optimizationSuggestions: safeSuggestions,
      detectedPatterns: safePatterns,
      codeSmells: safeCodeSmells,
      securityConcerns: safeSecurity,
      bestPractices: analysis.bestPractices || null,
      codeQualityScore: analysis.codeQualityScore || 75,
      readabilityScore: analysis.readabilityScore || 75,
      maintainabilityScore: analysis.maintainabilityScore || null,
      testabilityScore: analysis.testabilityScore || null,
      qualityBreakdown: analysis.qualityBreakdown || null,
      learningResources: safeResources,
      nextSteps: safeSteps,
      estimatedROI: analysis.estimatedROI || null
    };

    // CRITICAL: Use JSON serialization to break ALL references to original stringified data
    // This ensures Mongoose receives a completely clean object
    const cleanAnalysis = JSON.parse(JSON.stringify(analysisData));
    console.log(`🧼 Analysis cleaned via JSON serialization`);
    console.log(`🧼 Clean codeSmells[0] type: ${typeof cleanAnalysis.codeSmells[0]}`);
    
    // Add metadata about analysis
    if (analysisResult.usedFallback) {
      cleanAnalysis.note = 'Analysis generated using fallback method';
    }

    // ULTIMATE FIX: Use raw MongoDB collection to bypass ALL Mongoose processing
    // This completely avoids schema casting, setters, getters, and validation
    console.log(`💾 Using raw MongoDB collection.updateOne() to bypass Mongoose...`);
    
    const mongoose = require('mongoose');
    const updateResult = await mongoose.connection.collection('codereviews').updateOne(
      { _id: new mongoose.Types.ObjectId(reviewId) },
      {
        $set: {
          analysis: cleanAnalysis,
          optimizedCode: analysis.optimizedCode || `// Optimized version\n${review.code}`,
          status: 'completed',
          processingTime: processingTime,
          aiModel: analysisResult.model || 'fallback'
        }
      }
    );

    if (!updateResult.matchedCount) {
      throw new Error('Failed to update review - document not found');
    }

    console.log(`✅ Review ${reviewId} completed in ${processingTime}ms (AI: ${!analysisResult.usedFallback})`);
    
    // Fetch the updated document for progress tracking
    updatedReview = await CodeReview.findById(reviewId).lean();
    
    // ✅ NOW increment usage - only after successful analysis!
    if (subscription) {
      subscription.usage.codeReviewsUsed += 1;
      await subscription.save();
      const limit = subscription.features?.codeReviewsLimit || 'unlimited';
      console.log(`✅ Usage incremented: ${subscription.usage.codeReviewsUsed}/${limit} (${subscription.plan} plan)`);
    }
  } catch (error) {
    console.error('❌ Error processing review:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    
    // ❌ DON'T increment usage on failure - failed reviews are free!
    console.log(`⚠️ Review failed - user's quota NOT affected`);
    
    // Fallback to basic analysis on error - use clean JSON serialization
    try {
      const fallbackAnalysis = {
        timeComplexity: { before: 'O(n)', after: 'O(n)', improved: false, explanation: 'Analysis failed' },
        spaceComplexity: { before: 'O(1)', after: 'O(1)', improved: false, explanation: 'Analysis failed' },
        improvementPercentage: 0,
        performanceMetrics: null,
        optimizationSuggestions: [{
          title: 'Analysis failed',
          description: 'Please try submitting again',
          priority: 'low',
          lineNumber: 1
        }],
        detectedPatterns: [],
        codeSmells: [],
        securityConcerns: [],
        bestPractices: null,
        codeQualityScore: 0,
        readabilityScore: 0,
        maintainabilityScore: null,
        testabilityScore: null,
        qualityBreakdown: null,
        learningResources: [],
        nextSteps: [],
        estimatedROI: null
      };
      
      // Clean via JSON serialization (same approach as main flow)
      review.analysis = JSON.parse(JSON.stringify(fallbackAnalysis));
      review.optimizedCode = review.code;
      review.status = 'failed';
      review.processingTime = Date.now() - startTime;
      await review.save();
      console.log(`⚠️ Review ${reviewId} marked as failed`);
    } catch (saveError) {
      console.error('❌ Critical: Failed to save failed review:', saveError);
    }
    return;
  }

  // ⚡ ADDED: Invalidate dashboard cache for this user (ensure fresh data)
  try {
    const dashboardController = require('./dashboard.controller');
    if (dashboardController && dashboardController.invalidateUserCache) {
      dashboardController.invalidateUserCache(updatedReview.user.toString());
    }
  } catch (cacheError) {
    // Silently fail - cache invalidation is not critical
  }

  // ✅ Update user progress - ONLY called on successful reviews!
  if (!updatedReview) {
    console.error('❌ No updatedReview available - cannot update progress');
    return;
  }

  try {
    console.log(`📊 Updating user progress for successful review...`);
    console.log(`📊 User ID: ${updatedReview.user}`);
    
    let progress = await UserProgress.findOne({ user: updatedReview.user });
    if (!progress) {
      console.log(`📊 No progress found, creating new...`);
      progress = await UserProgress.create({
        user: updatedReview.user,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        stats: {
          totalReviews: 0,
          optimizedReviews: 0,
          totalImprovements: 0,
          averageImprovement: 0,
          currentStreak: 0,
          longestStreak: 0,
          codeQualityAverage: 0
        }
      });
      console.log(`📊 Created new user progress with ID: ${progress._id}`);
    }

    // Add XP based on improvement
    const improvementPercent = updatedReview.analysis.improvementPercentage || 50;
    
    // More granular XP calculation
    let xpGain;
    if (improvementPercent >= 90) {
      xpGain = 70;  // Exceptional improvement
    } else if (improvementPercent >= 70) {
      xpGain = 50;  // Significant improvement
    } else if (improvementPercent >= 50) {
      xpGain = 35;  // Moderate improvement
    } else if (improvementPercent >= 30) {
      xpGain = 20;  // Minor improvement
    } else {
      xpGain = 10;  // Minimal improvement
    }
    
    progress.addExperience(xpGain);

    // Update stats
    progress.stats.totalReviews += 1;
    console.log(`📊 Total reviews incremented to: ${progress.stats.totalReviews}`);
    
    if (improvementPercent > 0) {
      progress.stats.optimizedReviews += 1;
    }
    progress.stats.totalImprovements += improvementPercent;
    progress.stats.averageImprovement = 
      progress.stats.totalImprovements / progress.stats.totalReviews;
    
    const codeQuality = updatedReview.analysis.codeQualityScore || 75;
    progress.stats.codeQualityAverage = 
      ((progress.stats.codeQualityAverage * (progress.stats.totalReviews - 1)) + codeQuality) / 
      progress.stats.totalReviews;

    // Update streak
    progress.updateStreak();

    await progress.save();
    console.log(`📊 ✅ User progress saved successfully!`);
    console.log(`📊 Final stats: ${progress.stats.totalReviews} reviews, ${progress.stats.currentStreak} day streak, ${Math.round(progress.stats.averageImprovement)}% avg improvement`);
  } catch (progressError) {
    console.error(`❌ Error updating user progress:`, progressError);
    console.error(`   Progress error details:`, progressError.message);
    console.error(`   User ID:`, updatedReview.user);
  }

  // Update leaderboard (hybrid ELO + contribution model)
  try {
    console.log(`🏆 Updating leaderboard...`);
    
    // Re-fetch progress for leaderboard calculation
    const progressForLeaderboard = await UserProgress.findOne({ user: updatedReview.user });
    if (!progressForLeaderboard) {
      console.log(`⚠️ No progress found for leaderboard update`);
      return;
    }
    
    let leaderboardEntry = await Leaderboard.findOne({ user: updatedReview.user, period: 'all-time' });
    if (!leaderboardEntry) {
      leaderboardEntry = await Leaderboard.create({
        user: updatedReview.user,
        rating: BASELINE_RATING,
        contributionScore: 0,
        finalScore: 0,
        gamesPlayed: 0,
        score: 0,
        rank: 0,
        period: 'all-time'
      });
      console.log(`🏆 Created new leaderboard entry`);
    }

    // Find previous completed submission for match comparison
    const previousCompletedReview = await CodeReview.findOne({
      user: updatedReview.user,
      status: 'completed',
      _id: { $ne: updatedReview._id }
    })
      .select('analysis code createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // 1) Determine match outcome (win/loss/ignored)
    const improvementPercent = Number(updatedReview.analysis?.improvementPercentage || 0);
    const qualityScore = Number(updatedReview.analysis?.codeQualityScore || 0);
    const matchOutcome = determineMatchOutcome({
      improvement: improvementPercent,
      quality: qualityScore,
      previousReview: previousCompletedReview,
      currentCode: updatedReview.code || '',
      previousCode: previousCompletedReview?.code || ''
    });

    // 2) ELO update
    const currentRating = Number(leaderboardEntry.rating || BASELINE_RATING);
    const opponentRating = Number(previousCompletedReview?.analysis?.meta?.ratingSnapshot || BASELINE_RATING);
    let updatedRating = currentRating;

    if (matchOutcome.actualScore !== null) {
      updatedRating = updateRating(
        currentRating,
        opponentRating,
        matchOutcome.actualScore,
        leaderboardEntry.gamesPlayed || 0
      );
      leaderboardEntry.gamesPlayed = (leaderboardEntry.gamesPlayed || 0) + 1;
    }

    // 3) Contribution score update
    const contributionScore = computeContributionScore({
      totalReviews: progressForLeaderboard.stats.totalReviews,
      averageImprovement: progressForLeaderboard.stats.averageImprovement,
      level: progressForLeaderboard.level,
      streak: progressForLeaderboard.stats.currentStreak,
      codeQualityAverage: progressForLeaderboard.stats.codeQualityAverage
    });

    // 4) Final score update
    const finalScore = computeFinalScore(updatedRating, contributionScore);

    leaderboardEntry.rating = updatedRating;
    leaderboardEntry.contributionScore = contributionScore;
    leaderboardEntry.finalScore = finalScore;
    leaderboardEntry.score = finalScore; // Backward-compatible field for existing UI
    leaderboardEntry.stats = {
      ...(leaderboardEntry.stats || {}),
      totalReviews: progressForLeaderboard.stats.totalReviews,
      averageImprovement: progressForLeaderboard.stats.averageImprovement,
      level: progressForLeaderboard.level,
      streak: progressForLeaderboard.stats.currentStreak,
      lastSubmissionHash: computeNormalizedCodeHash(updatedReview.code || '')
    };
    leaderboardEntry.lastUpdated = new Date();

    // 5) Efficient rank calculation using indexed count query
    const oldRank = Number(leaderboardEntry.rank || 0);
    const currentRank = (await Leaderboard.countDocuments({
      period: 'all-time',
      finalScore: { $gt: finalScore }
    })) + 1;

    leaderboardEntry.previousRank = oldRank;
    leaderboardEntry.rank = currentRank;
    leaderboardEntry.rankChange = oldRank ? (oldRank - currentRank) : 0;

    await leaderboardEntry.save();
    console.log(`🏆 Score=${finalScore}, Rating=${updatedRating}, Rank=${currentRank}, Match=${matchOutcome.reason}`);
  } catch (leaderboardError) {
    console.error(`❌ Error updating leaderboard:`, leaderboardError.message);
  }

  // Create activity & notification (wrap in try-catch)
  try {
    const improvementPercent = updatedReview.analysis.improvementPercentage || 50;
    
    await Activity.create({
      user: updatedReview.user,
      type: 'review_completed',
      title: `Code review completed: ${updatedReview.title}`,
      description: `${improvementPercent}% improvement achieved`,
      icon: '⚡',
      relatedId: updatedReview._id,
      relatedModel: 'CodeReview',
      metadata: {
        language: updatedReview.language,
        improvement: improvementPercent
      }
    });

    await Notification.create({
      user: updatedReview.user,
      type: 'review_complete',
      title: 'Code Review Complete! 🎉',
      message: `Your "${updatedReview.title}" review is ready with ${improvementPercent}% improvement`,
      icon: '⚡',
      link: `/dashboard/review/${updatedReview._id}`,
      data: {
        reviewId: updatedReview._id,
        improvement: improvementPercent
      }
    });
    console.log(`📬 ✅ Activity and notification created`);
  } catch (activityError) {
    console.error(`❌ Error creating activity/notification:`, activityError.message);
  }
}

module.exports = {
  submitCode: exports.submitCode,
  getReviewStatus: exports.getReviewStatus,
  getReviewDetails: exports.getReviewDetails
};

