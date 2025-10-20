const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const { preventNoSQLInjection, preventXSS, preventHPP } = require('../middleware/security.middleware');
const addRequestId = require('../middleware/requestId.middleware');

// ⚡ OPTIMIZED: Pre-compute constants
const IS_DEV = process.env.NODE_ENV === 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const JSON_LIMIT = '10mb';

// ⚡ OPTIMIZED: Pre-create CORS options (avoid recreation)
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

// ⚡ OPTIMIZED: Pre-create compression options
const compressionOptions = {
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
};

// ⚡ OPTIMIZED: Pre-create JSON parser options
const jsonOptions = { limit: JSON_LIMIT };
const urlencodedOptions = { extended: true, limit: JSON_LIMIT };

// Configure all middleware for the Express app
const configureMiddleware = (app) => {
  // Trust proxy
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet());
  app.use(preventNoSQLInjection);
  app.use(preventXSS);
  app.use(preventHPP);

  // Request logging (development only)
  if (IS_DEV) {
    app.use(morgan('dev'));
  }

  // Add unique request ID
  app.use(addRequestId);

  // CORS Configuration
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json(jsonOptions));
  app.use(express.urlencoded(urlencodedOptions));

  // Compression middleware
  app.use(compression(compressionOptions));

  // Rate limiting for all API routes
  app.use('/api', apiLimiter);
};

module.exports = configureMiddleware;
