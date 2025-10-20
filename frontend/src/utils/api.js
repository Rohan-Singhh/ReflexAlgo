// ⚡ OPTIMIZED API UTILITY WITH CACHING & DEDUPLICATION

// Request cache to prevent duplicate requests
const requestCache = new Map();
const pendingRequests = new Map();

/**
 * Optimized fetch with:
 * - Request deduplication
 * - Automatic retries
 * - Response caching
 * - Timeout handling
 */
export async function apiRequest(url, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    cache = false,
    cacheTTL = 5000, // 5 seconds default
    timeout = 10000, // 10 seconds
    retries = 1,
    ...restOptions
  } = options;

  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;

  // ⚡ Check cache first (only for GET requests)
  if (cache && method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  // ⚡ Request deduplication - prevent duplicate requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Create request promise
  const requestPromise = (async () => {
    try {
      // ⚡ Timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...restOptions,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // ⚡ Cache successful GET responses
      if (cache && method === 'GET') {
        requestCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + cacheTTL,
        });
      }

      return data;
    } catch (error) {
      // ⚡ Auto-retry on network errors
      if (retries > 0 && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        return apiRequest(url, { ...options, retries: retries - 1 });
      }
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Auth-specific optimized requests
 */
export const authAPI = {
  async register(userData) {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: userData,
      timeout: 15000, // Longer timeout for registration
    });
  },

  async login(credentials) {
    return apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
      timeout: 10000,
    });
  },
};

/**
 * Clear request cache (call on logout)
 */
export function clearAPICache() {
  requestCache.clear();
  pendingRequests.clear();
}

