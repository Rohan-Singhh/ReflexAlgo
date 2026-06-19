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

// Pre-compiled username pattern (lowercase letters, numbers, underscores)
const USERNAME_REGEX = /^[a-z0-9_]+$/;

// Validation rules for profile updates (all fields optional / partial update)
const validateProfileUpdate = [
  body('name')
    .optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage(NAME_LENGTH)
    .matches(NAME_REGEX).withMessage(NAME_FORMAT),

  body('username')
    .optional().trim().toLowerCase()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(USERNAME_REGEX).withMessage('Username can only contain lowercase letters, numbers, and underscores'),

  body('headline').optional().trim().isLength({ max: 80 }).withMessage('Headline cannot exceed 80 characters'),
  body('bio').optional().trim().isLength({ max: 280 }).withMessage('Bio cannot exceed 280 characters'),
  body('location').optional().trim().isLength({ max: 80 }).withMessage('Location cannot exceed 80 characters'),
  body('goal').optional().trim().isLength({ max: 120 }).withMessage('Goal cannot exceed 120 characters'),

  body('links.github').optional({ checkFalsy: true }).trim().isURL().withMessage('GitHub link must be a valid URL'),
  body('links.linkedin').optional({ checkFalsy: true }).trim().isURL().withMessage('LinkedIn link must be a valid URL'),
  body('links.website').optional({ checkFalsy: true }).trim().isURL().withMessage('Website link must be a valid URL'),
  body('links.twitter').optional({ checkFalsy: true }).trim().isURL().withMessage('Twitter link must be a valid URL'),

  body('preferredLanguages').optional().isArray({ max: 12 }).withMessage('Too many languages selected'),

  body('visibility.isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('visibility.showActivity').optional().isBoolean().withMessage('showActivity must be a boolean'),
  body('visibility.showReviews').optional().isBoolean().withMessage('showReviews must be a boolean')
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

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  const errorMessages = [];
  const fieldErrors = {};
  const errorsArray = errors.array();
  const length = errorsArray.length;
  
  for (let i = 0; i < length; i++) {
    const error = errorsArray[i];
    errorMessages.push(error.msg);
    if (!fieldErrors[error.path]) {
      fieldErrors[error.path] = error.msg;
    }
  }

  const message = errorMessages.length === 1
    ? errorMessages[0]
    : `Please fix these fields: ${errorMessages.join('; ')}`;
  
  return res.status(400).json({
    success: false,
    message,
    error: message,
    errors: errorMessages,
    fieldErrors
  });
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  handleValidationErrors
};
