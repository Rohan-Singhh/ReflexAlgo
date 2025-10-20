const { authService } = require('../services');

// ⚡ OPTIMIZED: Reuse error responses (avoid creating objects every time)
const UNAUTHORIZED_RESPONSE = {
  success: false,
  message: 'Not authorized. Please login.'
};

const INVALID_TOKEN_RESPONSE = {
  success: false,
  message: 'Not authorized. Invalid token.'
};

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ⚡ OPTIMIZED: Single check + extract token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(UNAUTHORIZED_RESPONSE);
    }

    const token = authHeader.slice(7); // Faster than split

    if (!token) {
      return res.status(401).json(UNAUTHORIZED_RESPONSE);
    }

    // ⚡ Verify token (cached)
    const decoded = authService.verifyToken(token);

    // ⚡ CRITICAL: Get user (now uses cache!)
    const user = await authService.getUserById(decoded.id);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(INVALID_TOKEN_RESPONSE);
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };

