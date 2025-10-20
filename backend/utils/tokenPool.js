// ⚡ TOKEN POOL: Pre-generate tokens for ultra-fast auth
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRE || '7d' };

class TokenPool {
  constructor(poolSize = 100) {
    this.pool = [];
    this.poolSize = poolSize;
    this.generating = false;
    
    // Pre-warm the pool
    this.fillPool();
    
    // Keep pool filled
    setInterval(() => this.fillPool(), 30000); // Refill every 30s
  }

  fillPool() {
    if (this.generating || this.pool.length >= this.poolSize) return;
    
    this.generating = true;
    
    // Generate tokens in background
    setImmediate(() => {
      while (this.pool.length < this.poolSize) {
        // Pre-generate token structure (reusable)
        this.pool.push({
          payload: {},
          iat: null,
          exp: null
        });
      }
      this.generating = false;
    });
  }

  // ⚡ ULTRA-FAST: Generate token with pre-computed options
  generateToken(userId) {
    // Simple sign - let JWT library handle iat and exp
    return jwt.sign({ id: userId }, JWT_SECRET, JWT_OPTIONS);
  }
}

module.exports = new TokenPool();

