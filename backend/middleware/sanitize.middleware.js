const { body, validationResult } = require('express-validator');

// ⚡ OPTIMIZED: Pre-compile regex patterns (avoid recompilation)
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// ⚡ OPTIMIZED: Reuse error messages (User-friendly)
const NAME_REQUIRED = 'Please enter your name';
const NAME_LENGTH = 'Name must be between 2 and 50 characters';
const NAME_FORMAT = 'Name can only contain letters and spaces (no numbers or special characters)';
const EMAIL_REQUIRED = 'Please enter your email address';
const EMAIL_INVALID = 'Please enter a valid email address (e.g., user@example.com)';
const PASSWORD_REQUIRED = 'Please enter your password';
const PASSWORD_LENGTH = 'Password must be at least 6 characters long';
const PASSWORD_FORMAT = 'Password must include: uppercase letter, lowercase letter, and a number';

// Validation rules for registration
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage(NAME_REQUIRED)
    .isLength({ min: 2, max: 50 }).withMessage(NAME_LENGTH)
    .matches(NAME_REGEX).withMessage(NAME_FORMAT),
  
  body('email')
    .trim()
    .notEmpty().withMessage(EMAIL_REQUIRED)
    .isEmail().withMessage(EMAIL_INVALID)
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty().withMessage(PASSWORD_REQUIRED)
    .isLength({ min: 6 }).withMessage(PASSWORD_LENGTH)
    .matches(PASSWORD_REGEX).withMessage(PASSWORD_FORMAT)
];

// Validation rules for login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage(EMAIL_REQUIRED)
    .isEmail().withMessage(EMAIL_INVALID)
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty().withMessage(PASSWORD_REQUIRED)
];

// ⚡ OPTIMIZED: Reuse error response structure
const VALIDATION_FAILED = 'Validation failed';

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // ⚡ OPTIMIZED: Direct iteration instead of array().map()
  const errorMessages = [];
  const errorsArray = errors.array();
  const length = errorsArray.length;
  
  for (let i = 0; i < length; i++) {
    errorMessages.push(errorsArray[i].msg);
  }
  
  return res.status(400).json({
    success: false,
    message: VALIDATION_FAILED,
    errors: errorMessages
  });
};

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};
