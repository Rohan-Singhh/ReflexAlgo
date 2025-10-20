const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const subscriptionRoutes = require('./subscription.routes');

// Use route modules
router.use('/auth', authRoutes);
router.use('/subscription', subscriptionRoutes);

module.exports = router;

