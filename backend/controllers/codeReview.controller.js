const { CodeReview, UserProgress, Leaderboard, Activity, Notification, Subscription } = require('../models');
const { errorHandler } = require('../utils');
const aiService = require('../services/ai.service');

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

  // Check subscription limits
  const subscription = await Subscription.findOne({ user: userId });
  if (!subscription || !subscription.canCreateReview()) {
    return res.status(403).json({
      success: false,
      message: 'Review limit reached. Upgrade to Pro for unlimited reviews!',
      upgradeRequired: true
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

  // Increment subscription usage
  subscription.usage.codeReviewsUsed += 1;
  await subscription.save();

  // Process review asynchronously (mock AI analysis for now)
  processReview(review._id).catch(err => {
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
async function processReview(reviewId) {
  const startTime = Date.now();
  
  const review = await CodeReview.findById(reviewId);
  if (!review) return;

  try {
    // Perform AI analysis
    const analysisResult = await aiService.analyzeCode(
      review.code,
      review.language,
      review.title
    );

    // Extract analysis data
    const analysis = analysisResult.data;
    const processingTime = Date.now() - startTime;

    // Update review with AI results
    review.analysis = {
      timeComplexity: analysis.timeComplexity || { before: 'O(n)', after: 'O(n)', improved: false },
      spaceComplexity: analysis.spaceComplexity || { before: 'O(1)', after: 'O(1)', improved: false },
      improvementPercentage: analysis.improvementPercentage || 50,
      optimizationSuggestions: analysis.optimizationSuggestions || [],
      detectedPatterns: analysis.detectedPatterns || [],
      codeQualityScore: analysis.codeQualityScore || 75,
      readabilityScore: analysis.readabilityScore || 75
    };

    review.optimizedCode = analysis.optimizedCode || `// Optimized version\n${review.code}`;
    review.status = 'completed';
    review.processingTime = processingTime;
    review.aiModel = analysisResult.model || 'fallback';
    
    // Add metadata about analysis
    if (analysisResult.usedFallback) {
      review.analysis.note = 'Analysis generated using fallback method';
    }

    await review.save();
    console.log(`✅ Review ${reviewId} completed in ${processingTime}ms (AI: ${!analysisResult.usedFallback})`);
  } catch (error) {
    console.error('Error processing review:', error);
    
    // Fallback to basic analysis on error
    review.analysis = {
      timeComplexity: { before: 'O(n)', after: 'O(n)', improved: false },
      spaceComplexity: { before: 'O(1)', after: 'O(1)', improved: false },
      improvementPercentage: 50,
      optimizationSuggestions: [{
        title: 'Analysis failed',
        description: 'Please try submitting again',
        priority: 'low',
        lineNumber: 1
      }],
      detectedPatterns: [],
      codeQualityScore: 70,
      readabilityScore: 70
    };
    review.optimizedCode = review.code;
    review.status = 'failed';
    review.processingTime = Date.now() - startTime;
    await review.save();
    return;
  }

  // Update user progress
  let progress = await UserProgress.findOne({ user: review.user });
  if (!progress) {
    progress = await UserProgress.create({
      user: review.user,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    });
  }

  // Add XP based on improvement
  const improvementPercent = review.analysis.improvementPercentage || 50;
  const xpGain = improvementPercent >= 70 ? 50 : 30;
  progress.addExperience(xpGain);

  // Update stats
  progress.stats.totalReviews += 1;
  if (improvementPercent > 0) {
    progress.stats.optimizedReviews += 1;
  }
  progress.stats.totalImprovements += improvementPercent;
  progress.stats.averageImprovement = 
    progress.stats.totalImprovements / progress.stats.totalReviews;
  
  const codeQuality = review.analysis.codeQualityScore || 75;
  progress.stats.codeQualityAverage = 
    ((progress.stats.codeQualityAverage * (progress.stats.totalReviews - 1)) + codeQuality) / 
    progress.stats.totalReviews;

  // Update streak
  progress.updateStreak();

  await progress.save();

  // Update leaderboard
  let leaderboardEntry = await Leaderboard.findOne({ user: review.user, period: 'all-time' });
  if (!leaderboardEntry) {
    leaderboardEntry = await Leaderboard.create({
      user: review.user,
      score: 0,
      rank: 0,
      period: 'all-time'
    });
  }

  // Calculate new score
  leaderboardEntry.score = Leaderboard.calculateScore({
    totalReviews: progress.stats.totalReviews,
    averageImprovement: progress.stats.averageImprovement,
    level: progress.level,
    streak: progress.stats.currentStreak,
    codeQualityAverage: progress.stats.codeQualityAverage
  });
  await leaderboardEntry.save();

  // Recalculate ranks (simplified - in production, use a cron job)
  const allEntries = await Leaderboard.find({ period: 'all-time' }).sort({ score: -1 });
  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    const newRank = i + 1;
    const rankChange = entry.previousRank ? entry.previousRank - newRank : 0;
    
    entry.previousRank = entry.rank;
    entry.rank = newRank;
    entry.rankChange = rankChange;
    await entry.save();
  }

  // Create activity (reusing improvementPercent from above)
  await Activity.create({
    user: review.user,
    type: 'review_completed',
    title: `Code review completed: ${review.title}`,
    description: `${improvementPercent}% improvement achieved`,
    icon: '⚡',
    relatedId: review._id,
    relatedModel: 'CodeReview',
    metadata: {
      language: review.language,
      improvement: improvementPercent
    }
  });

  // Create notification
  await Notification.create({
    user: review.user,
    type: 'review_complete',
    title: 'Code Review Complete! 🎉',
    message: `Your "${review.title}" review is ready with ${improvementPercent}% improvement`,
    icon: '⚡',
    link: `/dashboard/review/${review._id}`,
    data: {
      reviewId: review._id,
      improvement: improvementPercent
    }
  });
}

module.exports = {
  submitCode: exports.submitCode,
  getReviewStatus: exports.getReviewStatus,
  getReviewDetails: exports.getReviewDetails
};

