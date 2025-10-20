// Custom Error Class for API Errors
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error types for better categorization
class ValidationError extends ApiError {
  constructor(message) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Not authenticated') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Not authorized') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

class InternalError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message);
    this.name = 'InternalError';
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError
};

