const { authService } = require('../services');

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

  // Update profile photo
  async updateProfilePhoto(req, res, next) {
    try {
      const { profilePhoto } = req.body;
      const userId = req.user._id;

      if (!profilePhoto) {
        return res.status(400).json({
          success: false,
          message: 'Profile photo is required'
        });
      }

      // Validate base64 image (basic check)
      if (!profilePhoto.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format'
        });
      }

      // Check size (limit to 2MB base64)
      if (profilePhoto.length > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image too large. Maximum size is 2MB'
        });
      }

      const updatedUser = await authService.updateProfilePhoto(userId, profilePhoto);

      res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
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

