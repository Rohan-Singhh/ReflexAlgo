const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/sanitize.middleware');

// ⚡ OPTIMIZED: Pre-bind controller methods (avoid .bind() on every request)
const register = authController.register.bind(authController);
const login = authController.login.bind(authController);
const getCurrentUser = authController.getCurrentUser.bind(authController);
const logout = authController.logout.bind(authController);

// Public routes with rate limiting and validation
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

module.exports = router;
