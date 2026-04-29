require('dotenv').config();
const mongoose = require('mongoose');
const { Leaderboard, UserProgress } = require('../models');
const {
  BASELINE_RATING,
  computeContributionScore,
  computeFinalScore
} = require('../services/leaderboard.service');

async function migrateLeaderboardHybrid() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    const total = await Leaderboard.countDocuments({ period: 'all-time' });
    console.log(`Found ${total} all-time leaderboard entries`);

    const BATCH_SIZE = 500;
    let processed = 0;
    let updated = 0;

    while (true) {
      const entries = await Leaderboard.find({ period: 'all-time' })
        .select('_id user rating contributionScore finalScore score gamesPlayed stats')
        .skip(processed)
        .limit(BATCH_SIZE)
        .lean();

      if (entries.length === 0) break;

      const userIds = entries.map((entry) => entry.user);
      const progressRows = await UserProgress.find({ user: { $in: userIds } })
        .select('user stats level')
        .lean();

      const progressMap = new Map(
        progressRows.map((row) => [row.user.toString(), row])
      );

      const bulkOps = [];
      for (const entry of entries) {
        const progress = progressMap.get(entry.user.toString());
        if (!progress) continue;

        const contributionScore = computeContributionScore({
          totalReviews: progress.stats?.totalReviews || 0,
          averageImprovement: progress.stats?.averageImprovement || 0,
          level: progress.level || 1,
          streak: progress.stats?.currentStreak || 0,
          codeQualityAverage: progress.stats?.codeQualityAverage || 0
        });

        const rating = Number(entry.rating || BASELINE_RATING);
        const finalScore = computeFinalScore(rating, contributionScore);
        const gamesPlayed = Number(entry.gamesPlayed || 0);

        const previousStats = entry.stats || {};
        const nextStats = {
          ...previousStats,
          totalReviews: progress.stats?.totalReviews || 0,
          averageImprovement: progress.stats?.averageImprovement || 0,
          level: progress.level || 1,
          streak: progress.stats?.currentStreak || 0,
          lastSubmissionHash: previousStats.lastSubmissionHash || ''
        };

        const needsUpdate =
          entry.contributionScore !== contributionScore ||
          entry.finalScore !== finalScore ||
          entry.score !== finalScore ||
          entry.rating !== rating ||
          entry.gamesPlayed !== gamesPlayed;

        if (!needsUpdate) continue;

        bulkOps.push({
          updateOne: {
            filter: { _id: entry._id },
            update: {
              $set: {
                rating,
                contributionScore,
                finalScore,
                score: finalScore,
                gamesPlayed,
                stats: nextStats,
                lastUpdated: new Date()
              }
            }
          }
        });
      }

      if (bulkOps.length > 0) {
        await Leaderboard.bulkWrite(bulkOps, { ordered: false });
        updated += bulkOps.length;
      }

      processed += entries.length;
      console.log(`Processed ${processed}/${total} entries...`);
    }

    console.log(`Migration completed. Updated ${updated} leaderboard entries.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLeaderboardHybrid();
