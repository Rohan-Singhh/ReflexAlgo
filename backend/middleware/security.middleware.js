const hpp = require('hpp');

// ⚡ OPTIMIZED: Custom NoSQL sanitization for Express 5 compatibility
// express-mongo-sanitize is not compatible with Express 5.x (req.query is read-only)
const preventNoSQLInjection = (req, res, next) => {
  // Sanitize req.body
  if (req.body) {
    req.body = sanitizeNoSQL(req.body);
  }

  // Sanitize req.params
  if (req.params) {
    req.params = sanitizeNoSQL(req.params);
  }

  // For Express 5, req.query is read-only, so we redefine it with sanitized version
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = sanitizeNoSQL(req.query);
    
    // Redefine query property with sanitized version
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: false,
      enumerable: true,
      configurable: true
    });
  }

  next();
};

// ⚡ OPTIMIZED: Custom XSS protection for Express 5 compatibility
// xss-clean is not compatible with Express 5.x (req.query is read-only)
const preventXSS = (req, res, next) => {
  // Sanitize req.body
  if (req.body) {
    req.body = sanitizeXSS(req.body);
  }

  // Sanitize req.params
  if (req.params) {
    req.params = sanitizeXSS(req.params);
  }

  // For Express 5, req.query is read-only, so we redefine it with sanitized version
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = sanitizeXSS(req.query);
    
    // Redefine query property with sanitized version
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: false,
      enumerable: true,
      configurable: true
    });
  }

  next();
};

// Helper function to recursively sanitize NoSQL injection patterns (removes $ and .)
function sanitizeNoSQL(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeNoSQL(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Remove keys that start with $ or contain . (NoSQL injection patterns)
      if (key.startsWith('$') || key.includes('.')) {
        sanitized[key.replace(/\$/g, '_').replace(/\./g, '_')] = sanitizeNoSQL(obj[key]);
      } else {
        sanitized[key] = sanitizeNoSQL(obj[key]);
      }
    }
  }
  return sanitized;
}

// Helper function to recursively sanitize XSS patterns
function sanitizeXSS(obj) {
  if (obj === null) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Remove HTML tags and dangerous characters
    return obj
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeXSS(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeXSS(obj[key]);
    }
  }
  return sanitized;
}

// ⚡ OPTIMIZED: Pre-create HPP options
const hppOptions = {
  whitelist: [] // Add parameters that are allowed to be duplicated
};

// ⚡ OPTIMIZED: Initialize HPP middleware once
const preventHPP = hpp(hppOptions);

module.exports = {
  preventNoSQLInjection,
  preventXSS,
  preventHPP
};
