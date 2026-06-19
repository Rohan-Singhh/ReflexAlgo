// Centralized service exports
const authService = require('./auth.service');
const subscriptionService = require('./subscription.service');
const aiService = require('./ai.service');
const roadmapCoachService = require('./roadmapCoach.service');
const achievementService = require('./achievement.service');
const profileService = require('./profile.service');

module.exports = {
  authService,
  subscriptionService,
  aiService,
  roadmapCoachService,
  achievementService,
  profileService
};

