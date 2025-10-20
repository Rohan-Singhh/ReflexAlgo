const express = require('express');
const router = express.Router();
const codeReviewController = require('../controllers/codeReview.controller');
const { protect } = require('../middleware');

// All routes require authentication
router.use(protect);

// Submit code for review
router.post('/submit', codeReviewController.submitCode);

// Get review status (for polling)
router.get('/:id/status', codeReviewController.getReviewStatus);

// Get full review details
router.get('/:id', codeReviewController.getReviewDetails);

module.exports = router;

