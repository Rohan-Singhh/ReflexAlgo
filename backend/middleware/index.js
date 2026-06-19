// Centralized middleware exports
const { protect } = require('./auth.middleware');
const { errorHandler, asyncHandler } = require('./errorHandler.middleware');
const { apiLimiter, authLimiter, passwordResetLimiter } = require('./rateLimiter.middleware');
const addRequestId = require('./requestId.middleware');
const { validateRegister, validateLogin, validateProfileUpdate, handleValidationErrors } = require('./sanitize.middleware');
const { preventNoSQLInjection, preventXSS, preventHPP } = require('./security.middleware');

module.exports = {
  // Auth middleware
  protect,
  
  // Error handling
  errorHandler,
  asyncHandler,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  
  // Request tracking
  addRequestId,
  
  // Validation
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  handleValidationErrors,
  
  // Security
  preventNoSQLInjection,
  preventXSS,
  preventHPP
};

