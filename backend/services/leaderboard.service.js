const crypto = require('crypto');

const BASELINE_RATING = 1200;
const MIN_K = 16;
const MAX_K = 32;
const IMPROVEMENT_WIN_THRESHOLD = 5;
const LOW_QUALITY_FORCE_LOSS_THRESHOLD = 40;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeContributionScore({
  totalReviews = 0,
  averageImprovement = 0,
  level = 1,
  streak = 0,
  codeQualityAverage = 0
}) {
  const reviewsScore = Math.log10(Math.max(0, totalReviews) + 1) / 3;
  const improvementScore = clamp(averageImprovement, 0, 100) / 100;
  const levelScore = clamp(level, 0, 10) / 10;
  const streakScore = Math.sqrt(clamp(streak, 0, 30)) / Math.sqrt(30);
  const qualityScore = clamp(codeQualityAverage, 0, 100) / 100;

  const weightedSum =
    (reviewsScore * 0.2) +
    (improvementScore * 0.25) +
    (levelScore * 0.2) +
    (streakScore * 0.15) +
    (qualityScore * 0.2);

  return Math.round(weightedSum * 1000);
}

function computeExpectedScore(playerRating, opponentRating) {
  return 1 / (1 + (10 ** ((opponentRating - playerRating) / 400)));
}

function computeKFactor(gamesPlayed = 0) {
  return Math.max(MIN_K, MAX_K - (Math.max(0, gamesPlayed) / 50));
}

function updateRating(playerRating, opponentRating, actualScore, gamesPlayed = 0) {
  const expected = computeExpectedScore(playerRating, opponentRating);
  const k = computeKFactor(gamesPlayed);
  return Math.round(playerRating + k * (actualScore - expected));
}

function computeFinalScore(rating, contributionScore) {
  return Math.round((rating * 0.7) + (contributionScore * 0.3));
}

function computeNormalizedCodeHash(code = '') {
  const normalized = code
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function isNearDuplicateSubmission(currentCode, previousCode) {
  if (!currentCode || !previousCode) return false;
  return computeNormalizedCodeHash(currentCode) === computeNormalizedCodeHash(previousCode);
}

function determineMatchOutcome({
  improvement = 0,
  quality = 0,
  previousReview = null,
  currentCode = '',
  previousCode = ''
}) {
  const duplicate =
    isNearDuplicateSubmission(currentCode, previousCode) ||
    isNearDuplicateSubmission(currentCode, previousReview?.code || '');

  if (duplicate) {
    return { actualScore: null, reason: 'near-duplicate-submission' };
  }

  if (quality < LOW_QUALITY_FORCE_LOSS_THRESHOLD) {
    return { actualScore: 0, reason: 'low-quality-force-loss' };
  }

  const previousImprovement = Number(previousReview?.analysis?.improvementPercentage || 0);
  const delta = Number(improvement || 0) - previousImprovement;
  const win = delta >= IMPROVEMENT_WIN_THRESHOLD;

  return { actualScore: win ? 1 : 0, reason: win ? 'threshold-win' : 'threshold-loss' };
}

module.exports = {
  BASELINE_RATING,
  computeContributionScore,
  computeExpectedScore,
  computeKFactor,
  updateRating,
  computeFinalScore,
  computeNormalizedCodeHash,
  isNearDuplicateSubmission,
  determineMatchOutcome
};
