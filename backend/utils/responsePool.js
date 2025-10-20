// ⚡ RESPONSE OBJECT POOL: Zero allocation responses
class ResponsePool {
  constructor() {
    this.successPool = [];
    this.errorPool = [];
    this.maxSize = 50;
    
    // Pre-create response objects
    this.warmUp();
  }

  warmUp() {
    for (let i = 0; i < 20; i++) {
      this.successPool.push({ success: true, data: null, message: null });
      this.errorPool.push({ success: false, error: null, message: null });
    }
  }

  // ⚡ Get success response (reused)
  getSuccess() {
    if (this.successPool.length === 0) {
      return { success: true, data: null, message: null };
    }
    return this.successPool.pop();
  }

  // ⚡ Get error response (reused)
  getError() {
    if (this.errorPool.length === 0) {
      return { success: false, error: null, message: null };
    }
    return this.errorPool.pop();
  }

  // ⚡ Release response back to pool
  release(response) {
    // Clear data
    response.data = null;
    response.error = null;
    response.message = null;
    response.token = null;
    response.user = null;

    if (response.success && this.successPool.length < this.maxSize) {
      this.successPool.push(response);
    } else if (!response.success && this.errorPool.length < this.maxSize) {
      this.errorPool.push(response);
    }
  }
}

module.exports = new ResponsePool();

