const authService = require('../services/auth.service');

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Service handles validation (sync validation first)
      const result = await authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      // Handle timeout or other errors
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Service handles validation (sync validation first)
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      // Handle timeout or other errors
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // ⚡ OPTIMIZED: User already in req from protect middleware
  async getCurrentUser(req, res, next) {
    try {
      // ⚡ MAJOR OPTIMIZATION: req.user already has user data from protect middleware
      // No need for additional DB query!
      res.status(200).json({
        success: true,
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // ⚡ OPTIMIZED: Logout with efficient cache clearing
  async logout(req, res) {
    try {
      const user = req.user;
      const token = req.headers.authorization?.slice(7); // Faster than split

      // ⚡ OPTIMIZED: Single call to clear both caches
      if (user) {
        authService.clearUserCache(user.email, user.id || user._id);
      }

      if (token) {
        authService.clearTokenCache(token);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    }
  }

  // Get cache stats (for monitoring/debugging)
  async getCacheStats(req, res) {
    try {
      const stats = authService.getCacheStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get cache stats'
      });
    }
  }
}

module.exports = new AuthController();

