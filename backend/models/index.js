// Centralized model exports
const User = require('./user.model');
const Subscription = require('./subscription.model');
const CodeReview = require('./codeReview.model');
const DSAPattern = require('./dsaPattern.model');
const UserProgress = require('./userProgress.model');
const Achievement = require('./achievement.model');
const Notification = require('./notification.model');
const Team = require('./team.model');
const Activity = require('./activity.model');
const Leaderboard = require('./leaderboard.model');

module.exports = {
  User,
  Subscription,
  CodeReview,
  DSAPattern,
  UserProgress,
  Achievement,
  Notification,
  Team,
  Activity,
  Leaderboard
};

