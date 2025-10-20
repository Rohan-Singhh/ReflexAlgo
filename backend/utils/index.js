// Centralized utility exports
const {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  catchAsync,
  errorHandler
} = require('./errorHandler');

const fastHash = require('./fastHash');
const responsePool = require('./responsePool');
const tokenPool = require('./tokenPool');

module.exports = {
  // Error classes
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  
  // Error handler wrapper
  catchAsync,
  errorHandler,
  
  // Utility modules
  fastHash,
  responsePool,
  tokenPool
};

