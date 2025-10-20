const { errorHandler } = require('../middleware');

// ⚡ OPTIMIZED: Reuse response objects
const NOT_FOUND_BASE = {
  success: false,
  message: 'Route not found'
};

// ⚡ OPTIMIZED: Health check with minimal overhead
const healthCheck = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: Date.now(), // ⚡ Faster than new Date().toISOString()
    uptime: process.uptime()
  });
};

// ⚡ OPTIMIZED: 404 handler with object reuse
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    ...NOT_FOUND_BASE,
    path: req.originalUrl
  });
};

// Configure all routes and error handlers
const configureRoutes = (app) => {
  // Health check route
  app.get('/health', healthCheck);

  // API Routes
  const apiRoutes = require('../routes');
  app.use('/api/v1', apiRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);
};

module.exports = configureRoutes;
