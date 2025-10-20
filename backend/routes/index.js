const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');

// Use route modules
router.use('/auth', authRoutes);

module.exports = router;

