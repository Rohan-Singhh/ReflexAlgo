const crypto = require('crypto');
const { UserProgress, CodeReview } = require('../models');
const aiService = require('./ai.service');
const patternPracticeCatalog = require('../../shared/patternPracticeCatalog.json');

const DIFFICULTY_POINTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3
};

const UPGRADE_MESSAGE = 'Unlock the full AI roadmap with Pro.';

const normalize = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const getOrCreateProgress = async (userId) => {
  let progress = await UserProgress.findOne({ user: userId }).populate('patterns.pattern', 'name');
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
    await progress.populate('patterns.pattern', 'name');
  }
  if (!progress.practice) {
    progress.practice = { solvedQuestions: [], totalPoints: 0 };
  }
  return progress;
};

const findCatalogPattern = (patternName) => {
  const normalizedName = normalize(patternName);
  return patternPracticeCatalog.find((pattern) => normalize(pattern.name) === normalizedName);
};

const buildSourceSignature = ({ progress, recentReviews }) => {
  const solvedIds = (progress.practice?.solvedQuestions || [])
    .map((question) => question.questionId)
    .sort();
  const patternProgress = (progress.patterns || []).map((item) => ({
    name: item.pattern?.name || '',
    mastery: Math.round(item.mastery || 0),
    solved: item.problemsSolved || 0
  }));
  const latestReview = recentReviews[0];

  return crypto.createHash('sha1').update(JSON.stringify({
    solvedIds,
    patternProgress,
    latestReview: latestReview ? {
      id: latestReview._id?.toString(),
      createdAt: latestReview.createdAt
    } : null
  })).digest('hex');
};

const getDetectedPatternCounts = (recentReviews) => {
  const counts = new Map();
  for (const review of recentReviews) {
    const patterns = review.analysis?.detectedPatterns || [];
    for (const detected of patterns) {
      const detectedName = normalize(detected.pattern);
      const catalogPattern = patternPracticeCatalog.find((pattern) => {
        const name = normalize(pattern.name);
        return detectedName === name || detectedName.includes(name) || name.includes(detectedName);
      });
      if (catalogPattern) {
        counts.set(catalogPattern.name, (counts.get(catalogPattern.name) || 0) + 1);
      }
    }
  }
  return counts;
};

const getProgressByPattern = (progress) => {
  const map = new Map();
  for (const item of progress.patterns || []) {
    const name = item.pattern?.name;
    if (!name) continue;
    map.set(name, {
      mastery: Math.round(item.mastery || 0),
      problemsSolved: item.problemsSolved || 0
    });
  }
  return map;
};

const getRecentPracticeCounts = (progress) => {
  const cutoff = Date.now() - (14 * 24 * 60 * 60 * 1000);
  const counts = new Map();
  for (const question of progress.practice?.solvedQuestions || []) {
    const solvedAt = question.solvedAt ? new Date(question.solvedAt).getTime() : 0;
    if (solvedAt < cutoff) continue;
    counts.set(question.patternName, (counts.get(question.patternName) || 0) + 1);
  }
  return counts;
};

const scorePatterns = ({ progress, recentReviews }) => {
  const solvedIds = new Set((progress.practice?.solvedQuestions || []).map((question) => question.questionId));
  const detectedCounts = getDetectedPatternCounts(recentReviews);
  const progressByPattern = getProgressByPattern(progress);
  const recentPracticeCounts = getRecentPracticeCounts(progress);

  return patternPracticeCatalog.map((pattern, index) => {
    const total = pattern.questions.length;
    const solvedInPattern = pattern.questions.filter((question) => solvedIds.has(question.id)).length;
    const unsolvedRatio = total > 0 ? (total - solvedInPattern) / total : 0;
    const patternProgress = progressByPattern.get(pattern.name) || {};
    const mastery = patternProgress.mastery || 0;
    const detectedCount = detectedCounts.get(pattern.name) || 0;
    const recentPractice = recentPracticeCounts.get(pattern.name) || 0;
    const beginnerBias = index === 0 && solvedIds.size === 0 && recentReviews.length === 0 ? 10 : 0;

    const score =
      (unsolvedRatio * 45) +
      ((100 - mastery) * 0.25) +
      (detectedCount * 14) +
      (recentPractice === 0 ? 8 : 0) +
      (Math.max(0, 5 - solvedInPattern) * 1.5) +
      beginnerBias;

    return {
      pattern,
      score,
      solvedInPattern,
      mastery,
      detectedCount,
      recentPractice
    };
  }).sort((a, b) => b.score - a.score);
};

const getDifficultyRank = ({ difficulty, solvedInPattern, mastery }) => {
  if (solvedInPattern < 2) {
    return { Easy: 0, Medium: 1, Hard: 2 }[difficulty] ?? 1;
  }
  if (mastery < 60) {
    return { Medium: 0, Easy: 1, Hard: 2 }[difficulty] ?? 1;
  }
  return { Medium: 0, Hard: 1, Easy: 2 }[difficulty] ?? 1;
};

const getDefaultReason = ({ patternName, difficulty, detectedCount, mastery }) => {
  if (detectedCount > 0) {
    return `Connects directly to patterns found in your recent code review.`;
  }
  if (mastery < 35) {
    return `Builds core ${patternName} confidence before harder interview variants.`;
  }
  if (difficulty === 'Hard') {
    return `Pushes your ${patternName} mastery toward interview-ready depth.`;
  }
  return `Keeps your ${patternName} progress moving with a focused next step.`;
};

const selectRecommendations = ({ scoredPatterns, progress }) => {
  const solvedIds = new Set((progress.practice?.solvedQuestions || []).map((question) => question.questionId));
  const recommendations = [];

  for (const scored of scoredPatterns) {
    const candidates = scored.pattern.questions
      .filter((question) => !solvedIds.has(question.id))
      .map((question, index) => ({ ...question, originalIndex: index }))
      .sort((a, b) => {
        const diff = getDifficultyRank({
          difficulty: a.difficulty,
          solvedInPattern: scored.solvedInPattern,
          mastery: scored.mastery
        }) - getDifficultyRank({
          difficulty: b.difficulty,
          solvedInPattern: scored.solvedInPattern,
          mastery: scored.mastery
        });
        if (diff !== 0) return diff;
        return (DIFFICULTY_POINTS[a.difficulty] || 2) - (DIFFICULTY_POINTS[b.difficulty] || 2) || a.originalIndex - b.originalIndex;
      });

    for (const question of candidates) {
      recommendations.push({
        id: question.id,
        title: question.title,
        platform: question.platform,
        difficulty: question.difficulty,
        url: question.url,
        reason: getDefaultReason({
          patternName: scored.pattern.name,
          difficulty: question.difficulty,
          detectedCount: scored.detectedCount,
          mastery: scored.mastery
        }),
        patternName: scored.pattern.name
      });
      if (recommendations.length >= 3) return recommendations;
    }
  }

  return recommendations;
};

const buildDeterministicRoadmap = ({ progress, recentReviews }) => {
  const scoredPatterns = scorePatterns({ progress, recentReviews });
  const focus = scoredPatterns[0] || {
    pattern: patternPracticeCatalog[0],
    score: 0,
    mastery: 0,
    detectedCount: 0,
    solvedInPattern: 0
  };
  const recommendations = selectRecommendations({ scoredPatterns, progress });
  const signal = focus.detectedCount > 0
    ? 'your recent code review surfaced this pattern'
    : focus.solvedInPattern === 0
    ? 'you have not started this pattern yet'
    : `your mastery is around ${focus.mastery}%`;

  return {
    focusPattern: focus.pattern.name,
    headline: `Focus on ${focus.pattern.name} next`,
    whyThisMatters: `${focus.pattern.name} is the best next step because ${signal}.`,
    weeklyGoal: `Solve ${Math.min(3, recommendations.length)} ${focus.pattern.name} problem${recommendations.length === 1 ? '' : 's'} this week.`,
    recommendations,
    weakSignals: {
      mastery: focus.mastery,
      solvedInPattern: focus.solvedInPattern,
      detectedInRecentReviews: focus.detectedCount,
      score: Math.round(focus.score)
    }
  };
};

const mergeAICoachCopy = (roadmap, aiCopy) => {
  if (!aiCopy) return { ...roadmap, usedAI: false };
  const reasonById = new Map((aiCopy.recommendations || []).map((item) => [item.id, item.reason]));
  return {
    ...roadmap,
    headline: aiCopy.headline || roadmap.headline,
    whyThisMatters: aiCopy.whyThisMatters || roadmap.whyThisMatters,
    weeklyGoal: aiCopy.weeklyGoal || roadmap.weeklyGoal,
    recommendations: roadmap.recommendations.map((item) => ({
      ...item,
      reason: reasonById.get(item.id) || item.reason
    })),
    usedAI: Boolean(aiCopy.usedAI)
  };
};

const getRoadmapCoach = async (userId, options = {}) => {
  const { forceRefresh = false, includeAI = false } = options;
  const progress = await getOrCreateProgress(userId);
  const recentReviews = await CodeReview.find({ user: userId, status: 'completed' })
    .select('title createdAt analysis.detectedPatterns analysis.optimizationSuggestions analysis.codeQualityScore')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  const sourceSignature = buildSourceSignature({ progress, recentReviews });
  const cached = progress.roadmapCoach;

  if (
    cached?.sourceSignature === sourceSignature &&
    !forceRefresh &&
    (!includeAI || cached.usedAI)
  ) {
    return {
      focusPattern: cached.focusPattern,
      headline: cached.headline,
      whyThisMatters: cached.whyThisMatters,
      weeklyGoal: cached.weeklyGoal,
      recommendations: cached.recommendations || [],
      sourceSignature: cached.sourceSignature,
      generatedAt: cached.generatedAt,
      usedAI: Boolean(cached.usedAI)
    };
  }

  let roadmap = buildDeterministicRoadmap({ progress, recentReviews });
  let aiCopy = null;
  if (includeAI) {
    aiCopy = await aiService.generateRoadmapCoach({
      focusPattern: roadmap.focusPattern,
      headline: roadmap.headline,
      whyThisMatters: roadmap.whyThisMatters,
      weeklyGoal: roadmap.weeklyGoal,
      recommendations: roadmap.recommendations,
      weakSignals: roadmap.weakSignals,
      recentReviews: recentReviews.map((review) => ({
        title: review.title,
        patterns: review.analysis?.detectedPatterns?.map((item) => item.pattern) || [],
        qualityScore: review.analysis?.codeQualityScore || null
      }))
    });
  }

  roadmap = mergeAICoachCopy(roadmap, aiCopy);
  const generatedAt = new Date();
  progress.roadmapCoach = {
    focusPattern: roadmap.focusPattern,
    headline: roadmap.headline,
    whyThisMatters: roadmap.whyThisMatters,
    weeklyGoal: roadmap.weeklyGoal,
    recommendations: roadmap.recommendations,
    sourceSignature,
    generatedAt,
    usedAI: roadmap.usedAI
  };
  await progress.save();

  return {
    ...roadmap,
    sourceSignature,
    generatedAt
  };
};

const formatRoadmapForAccess = (roadmap, hasFullAccess) => {
  const recommendations = roadmap.recommendations || [];
  if (hasFullAccess) {
    return {
      isLocked: false,
      usedAI: Boolean(roadmap.usedAI),
      generatedAt: roadmap.generatedAt,
      focusPattern: roadmap.focusPattern,
      headline: roadmap.headline,
      whyThisMatters: roadmap.whyThisMatters,
      weeklyGoal: roadmap.weeklyGoal,
      recommendations,
      lockedCount: 0,
      upgradeMessage: ''
    };
  }

  return {
    isLocked: true,
    usedAI: false,
    generatedAt: roadmap.generatedAt,
    focusPattern: roadmap.focusPattern,
    headline: roadmap.headline,
    whyThisMatters: roadmap.whyThisMatters,
    weeklyGoal: roadmap.weeklyGoal,
    recommendations: recommendations.slice(0, 1),
    lockedCount: Math.max(0, recommendations.length - 1),
    upgradeMessage: UPGRADE_MESSAGE
  };
};

const invalidateRoadmapCoach = (progress) => {
  if (!progress) return;
  progress.roadmapCoach = undefined;
  progress.markModified('roadmapCoach');
};

module.exports = {
  getRoadmapCoach,
  formatRoadmapForAccess,
  invalidateRoadmapCoach,
  scorePatterns,
  selectRecommendations
};
