// ⚡ OPTIMIZED: Pre-create error response objects
const VALIDATION_ERROR = { statusCode: 400 };
const CAST_ERROR = { statusCode: 400 };
const DUPLICATE_ERROR = { statusCode: 409 };
const JWT_ERROR = { statusCode: 401, message: 'Invalid token. Please login again.' };
const JWT_EXPIRED = { statusCode: 401, message: 'Token expired. Please login again.' };

const IS_DEV = process.env.NODE_ENV === 'development';

// Handle Mongoose Validation Errors
const handleValidationError = (err) => {
  const errValues = Object.values(err.errors);
  const length = errValues.length;
  const errors = new Array(length);
  
  for (let i = 0; i < length; i++) {
    errors[i] = errValues[i].message;
  }
  
  return {
    statusCode: 400,
    message: `Invalid input data. ${errors.join('. ')}`
  };
};

// Handle Mongoose Duplicate Key Errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: 409,
    message: `${field} already exists. Please use another value.`
  };
};

// Handle Mongoose Cast Errors (Invalid ID)
const handleCastError = (err) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`
  };
};

// ⚡ OPTIMIZED: Use Map for faster error type lookup
const errorHandlers = new Map([
  ['ValidationError', handleValidationError],
  ['CastError', handleCastError],
  ['JsonWebTokenError', () => JWT_ERROR],
  ['TokenExpiredError', () => JWT_EXPIRED]
]);

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // ⚡ OPTIMIZED: Direct assignment instead of spread operator
  const statusCode = err.statusCode || 500;
  const message = err.message;

  // Log in development only
  if (IS_DEV) {
    console.error('Error:', {
      message,
      stack: err.stack,
      statusCode
    });
  }

  let finalStatusCode = statusCode;
  let finalMessage = message;

  // ⚡ OPTIMIZED: Use Map lookup instead of multiple if statements
  const handler = errorHandlers.get(err.name);
  if (handler) {
    const handled = handler(err);
    finalStatusCode = handled.statusCode;
    finalMessage = handled.message;
  } else if (err.code === 11000) {
    // Mongoose Duplicate Key Error
    const handled = handleDuplicateKeyError(err);
    finalStatusCode = handled.statusCode;
    finalMessage = handled.message;
  }

  // ⚡ OPTIMIZED: Conditional object creation
  const response = {
    success: false,
    error: finalMessage
  };

  if (IS_DEV) {
    response.stack = err.stack;
  }

  res.status(finalStatusCode).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
