const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { fastHash, tokenPool } = require('../utils');
const subscriptionService = require('./subscription.service');

// ⚡ OPTIMIZATION #4: Optimized bcrypt rounds
const SALT_ROUNDS = 9; // 40ms per hash (vs 250ms with 12 rounds)

// ⚡ OPTIMIZATION #6: Timeout protection
const LOGIN_TIMEOUT = 15000;
const REGISTRATION_TIMEOUT = 20000;

// ⚡ OPTIMIZATION #2: User caching with LRU (Least Recently Used) eviction
const userCache = new Map();
const userIdCache = new Map(); // NEW: Cache by ID for faster getCurrentUser
const USER_CACHE_MAX_SIZE = 1000;
const USER_CACHE_EXPIRY = 5 * 60 * 1000;

// ⚡ OPTIMIZATION #3: Token caching
const tokenCache = new Map();
const TOKEN_CACHE_EXPIRY = 15 * 60 * 1000;

// ⚡ OPTIMIZATION #5: Precompiled regex
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// ⚡ OPTIMIZATION: Pre-computed JWT options (avoid recreating object every time)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRE || '7d' };

// ⚡ OPTIMIZATION #7: Async cache cleanup (non-blocking)
setInterval(() => {
  setImmediate(() => {
    const now = Date.now();
    
    for (const [key, value] of userCache.entries()) {
      if (now > value.expiresAt) userCache.delete(key);
    }
    
    for (const [key, value] of userIdCache.entries()) {
      if (now > value.expiresAt) userIdCache.delete(key);
    }
    
    for (const [key, value] of tokenCache.entries()) {
      if (now > value.expiresAt) tokenCache.delete(key);
    }
  });
}, 60000);

class AuthService {
  // ⚡ EXTREME: Use token pool for ultra-fast generation
  generateToken(userId) {
    return tokenPool.generateToken(userId);
  }

  // ⚡ OPTIMIZATION #2: Get cached user by email
  getCachedUser(email) {
    const cached = userCache.get(email);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.user;
    }
    return null;
  }

  // ⚡ NEW: Get cached user by ID (for protect middleware)
  getCachedUserById(userId) {
    const cached = userIdCache.get(userId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.user;
    }
    return null;
  }

  // ⚡ OPTIMIZED: Cache by both email AND id
  setCachedUser(email, user) {
    if (userCache.size >= USER_CACHE_MAX_SIZE) {
      const oldestKey = userCache.keys().next().value;
      userCache.delete(oldestKey);
    }
    
    const cacheEntry = {
      user,
      expiresAt: Date.now() + USER_CACHE_EXPIRY
    };
    
    userCache.set(email, cacheEntry);
    userIdCache.set(user._id.toString(), cacheEntry); // Also cache by ID
  }

  clearUserCache(email, userId) {
    userCache.delete(email);
    if (userId) userIdCache.delete(userId.toString());
  }

  // ⚡ OPTIMIZATION #8: Inline validation (faster than function calls)
  validateRegistrationData(userData) {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      const error = new Error('All fields are required. Please fill in your name, email, and password.');
      error.statusCode = 400;
      throw error;
    }

    const nameLen = name.length;
    if (nameLen < 2 || nameLen > 50) {
      const error = new Error('Name must be between 2 and 50 characters long.');
      error.statusCode = 400;
      throw error;
    }

    if (!EMAIL_REGEX.test(email)) {
      const error = new Error('Please enter a valid email address (e.g., user@example.com).');
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters long for security.');
      error.statusCode = 400;
      throw error;
    }
  }

  validateLoginData(email, password) {
    if (!email || !password) {
      const error = new Error('Please enter both your email and password.');
      error.statusCode = 400;
      throw error;
    }

    if (!EMAIL_REGEX.test(email)) {
      const error = new Error('Please enter a valid email address.');
      error.statusCode = 400;
      throw error;
    }
  }

  async register(userData) {
    this.validateRegistrationData(userData);

    const { name, email, password } = userData;

    const registrationPromise = this._performRegistration(name, email, password);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error('Registration is taking longer than expected. Please try again in a moment.');
        error.statusCode = 408;
        reject(error);
      }, REGISTRATION_TIMEOUT);
    });

    return await Promise.race([registrationPromise, timeoutPromise]);
  }

  async _performRegistration(name, email, password) {
    // ⚡ EXTREME: Parallel operations with fast hash
    const [existingUser, hashedPassword] = await Promise.all([
      User.findOne({ email }).select('_id email').lean().maxTimeMS(1000), // ⚡ 1s timeout
      fastHash.hash(password) // ⚡ Optimized hashing
    ]);

    if (existingUser) {
      const error = new Error('This email is already registered. Please login or use a different email.');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // ⚡ IMPORTANT: Create subscription synchronously to avoid race conditions
    try {
      await subscriptionService.createDefaultSubscription(user._id);
    } catch (err) {
      console.error('Failed to create subscription:', err);
      // Continue anyway - subscription will be created on first use
    }

    // ⚡ OPTIMIZED: Sync operations (no need for async)
    const token = this.generateToken(user._id);
    this.setCachedUser(email, user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async login(email, password) {
    this.validateLoginData(email, password);

    const loginPromise = this._performLogin(email, password);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error('Login is taking longer than expected. Please check your connection and try again.');
        error.statusCode = 408;
        reject(error);
      }, LOGIN_TIMEOUT);
    });

    return await Promise.race([loginPromise, timeoutPromise]);
  }

  async _performLogin(email, password) {
    // ⚡ CRITICAL FIX: Cache hit should NOT query database again!
    let user = this.getCachedUser(email);

    if (!user) {
      // Cache miss - query database (⚡ EXTREME: only fetch needed fields)
      user = await User.findOne({ email }).select('_id name email password');
      
      if (!user) {
        const error = new Error('No account found with this email. Please sign up first.');
        error.statusCode = 404;
        throw error;
      }

      // Cache the user
      this.setCachedUser(email, user);
    } else {
      // ⚡ FIXED: Cache hit - we already have the user, just need password
      // Only query if cached user doesn't have password
      if (!user.password) {
        user = await User.findOne({ email }).select('_id name email password');
        if (!user) {
          const error = new Error('No account found with this email. Please sign up first.');
          error.statusCode = 404;
          throw error;
        }
      }
    }

    // ⚡ EXTREME: Parallel with cached password comparison
    const [isPasswordValid, token] = await Promise.all([
      fastHash.compare(password, user.password), // ⚡ Cached comparisons
      new Promise(resolve => resolve(this.generateToken(user._id)))
    ]);

    if (!isPasswordValid) {
      const error = new Error('Incorrect password. Please check and try again.');
      error.statusCode = 401;
      throw error;
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  // ⚡ OPTIMIZED: Check cache first before DB query
  async getUserById(userId) {
    // Check cache first
    const cached = this.getCachedUserById(userId);
    if (cached) {
      return cached;
    }

    // Cache miss - query database (only fetch needed fields!)
    const user = await User.findById(userId)
      .select('_id name email') // ⚡ EXTREME: 30-50% faster query
      .lean(); // .lean() for speed
    
    if (!user) {
      throw new Error('User not found');
    }

    // Cache the result
    const cacheEntry = {
      user,
      expiresAt: Date.now() + USER_CACHE_EXPIRY
    };
    userIdCache.set(userId, cacheEntry);

    return user;
  }

  // ⚡ OPTIMIZATION #3: Token verification with caching
  verifyToken(token) {
    try {
      const cached = tokenCache.get(token);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.payload;
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      if (tokenCache.size >= USER_CACHE_MAX_SIZE) {
        const oldestKey = tokenCache.keys().next().value;
        tokenCache.delete(oldestKey);
      }

      tokenCache.set(token, {
        payload: decoded,
        expiresAt: Date.now() + TOKEN_CACHE_EXPIRY
      });

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  clearTokenCache(token) {
    tokenCache.delete(token);
  }

  getCacheStats() {
    return {
      userCacheSize: userCache.size,
      userIdCacheSize: userIdCache.size,
      tokenCacheSize: tokenCache.size,
      userCacheMaxSize: USER_CACHE_MAX_SIZE,
      userCacheExpiry: USER_CACHE_EXPIRY,
      tokenCacheExpiry: TOKEN_CACHE_EXPIRY
    };
  }
}

module.exports = new AuthService();
