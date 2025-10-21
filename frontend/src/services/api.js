import axios from 'axios';

// ⚡ FIXED: Request deduplication cache with actual promise sharing
const pendingRequests = new Map();

// ⚡ Generate request key for deduplication
const getRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Create axios instance with optimized config
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000, // ⚡ 10s timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⚡ FIXED: Request interceptor - Add auth token + proper deduplication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⚡ Deduplicate GET requests ONLY (prevent parallel duplicate calls)
    // POST/PUT/DELETE should NOT be deduplicated as they may have side effects
    if (config.method === 'get') {
      const requestKey = getRequestKey(config);
      
      // If same request is already pending, return the existing promise
      if (pendingRequests.has(requestKey)) {
        const existingPromise = pendingRequests.get(requestKey);
        
        // Return a promise that resolves/rejects with the existing request
        // This prevents the new request from even being sent
        throw {
          isDeduplicated: true,
          promise: existingPromise
        };
      }
      
      // Mark this request for tracking
      config._requestKey = requestKey;
    }

    return config;
  },
  (error) => {
    // Handle deduplicated requests
    if (error?.isDeduplicated) {
      return error.promise;
    }
    return Promise.reject(error);
  }
);

// ⚡ FIXED: Response interceptor - Handle errors + cleanup deduplication
api.interceptors.response.use(
  (response) => {
    // ⚡ Cleanup deduplication cache on success
    if (response.config._requestKey) {
      pendingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  (error) => {
    // ⚡ Cleanup deduplication cache on error
    if (error.config?._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ⚡ Wrapper to track promises for deduplication
const originalRequest = api.request.bind(api);
api.request = function(config) {
  const requestKey = config.method === 'get' ? getRequestKey(config) : null;
  
  if (requestKey && !pendingRequests.has(requestKey)) {
    // Create and store the promise
    const promise = originalRequest(config);
    pendingRequests.set(requestKey, promise);
    
    // Auto-cleanup after request completes
    promise.finally(() => {
      pendingRequests.delete(requestKey);
    });
    
    return promise;
  }
  
  return originalRequest(config);
};

export default api;

