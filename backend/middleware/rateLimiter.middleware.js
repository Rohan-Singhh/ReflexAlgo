const rateLimit = require('express-rate-limit');

// ⚡ OPTIMIZED: Pre-compute constants
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// ⚡ OPTIMIZED: Reuse error messages (avoid object creation)
const API_LIMIT_MESSAGE = {
  success: false,
  message: 'Too many requests from this IP, please try again later.'
};

const AUTH_LIMIT_MESSAGE = {
  success: false,
  message: 'Too many authentication attempts, please try again after 15 minutes.'
};

const PASSWORD_RESET_MESSAGE = {
  success: false,
  message: 'Too many password reset attempts, please try again after an hour.'
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 100,
  message: API_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  skipSuccessfulRequests: false,
  message: AUTH_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false
});

// Very strict limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: ONE_HOUR,
  max: 3,
  message: PASSWORD_RESET_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};
