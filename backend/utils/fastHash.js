// ⚡ ULTRA-FAST HASHING: Cache common password hashes
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 9;

class FastHash {
  constructor() {
    // Cache for recently hashed passwords (security trade-off for speed)
    this.hashCache = new Map();
    this.maxCacheSize = 100;
    this.cacheExpiry = 60000; // 1 minute
    
    // Cleanup
    setInterval(() => this.cleanup(), 60000);
  }

  async hash(password) {
    // For production: Don't cache hashes (security risk)
    // This is just for demonstration of extreme optimization
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password, hash) {
    // Check cache for recent comparisons (careful with security!)
    const cacheKey = `${password}:${hash}`;
    const cached = this.hashCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.result;
    }

    // Perform comparison
    const result = await bcrypt.compare(password, hash);
    
    // Cache result (1 minute only)
    if (this.hashCache.size >= this.maxCacheSize) {
      const firstKey = this.hashCache.keys().next().value;
      this.hashCache.delete(firstKey);
    }
    
    this.hashCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + this.cacheExpiry
    });
    
    return result;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.hashCache.entries()) {
      if (now > value.expiresAt) {
        this.hashCache.delete(key);
      }
    }
  }
}

module.exports = new FastHash();

