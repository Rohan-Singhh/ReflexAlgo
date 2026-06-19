const express = require('express');
const router = express.Router();
const { profileController } = require('../controllers');
const { protect, validateProfileUpdate, handleValidationErrors } = require('../middleware');

// Public, privacy-aware profile by username (no auth required)
router.get('/u/:username', profileController.getPublicProfile);

// Public achievement catalog (no auth required)
router.get('/achievements/catalog', profileController.getAchievementCatalog);

// Authenticated profile routes
router.get('/', protect, profileController.getMyProfile);
router.patch('/', protect, validateProfileUpdate, handleValidationErrors, profileController.updateMyProfile);
router.get('/username-available', protect, profileController.checkUsername);

module.exports = router;
