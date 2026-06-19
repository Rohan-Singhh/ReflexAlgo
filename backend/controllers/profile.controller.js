const { errorHandler } = require('../utils');
const profileService = require('../services/profile.service');
const achievementService = require('../services/achievement.service');

// GET /api/v1/profile — the authenticated user's full profile
exports.getMyProfile = errorHandler(async (req, res) => {
  const data = await profileService.getOwnProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

// PATCH /api/v1/profile — update the authenticated user's profile
exports.updateMyProfile = errorHandler(async (req, res) => {
  const data = await profileService.updateProfile(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Profile updated', data });
});

// GET /api/v1/profile/username-available?u=<username>
exports.checkUsername = errorHandler(async (req, res) => {
  const result = await profileService.isUsernameAvailable(req.query.u, req.user._id);
  res.status(200).json({ success: true, data: result });
});

// GET /api/v1/profile/u/:username — public, privacy-aware profile
exports.getPublicProfile = errorHandler(async (req, res) => {
  const data = await profileService.getPublicProfile(req.params.username);
  // Public profiles are cacheable briefly to reduce load.
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  res.status(200).json({ success: true, data });
});

// GET /api/v1/profile/achievements/catalog — full achievement catalog (public)
exports.getAchievementCatalog = errorHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.status(200).json({ success: true, data: achievementService.getCatalog() });
});

module.exports = {
  getMyProfile: exports.getMyProfile,
  updateMyProfile: exports.updateMyProfile,
  checkUsername: exports.checkUsername,
  getPublicProfile: exports.getPublicProfile,
  getAchievementCatalog: exports.getAchievementCatalog
};
