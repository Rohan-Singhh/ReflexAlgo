const mongoose = require('mongoose');

// ⚡ OPTIMIZED: Pre-compute constants
const SHUTDOWN_TIMEOUT = 10000;

// Reuse log messages
const HTTP_CLOSED = 'HTTP server closed';
const MONGO_CLOSED = 'Database connection closed';
const FORCE_SHUTDOWN = 'Shutdown timeout - forcing exit';
const UNCAUGHT_EXCEPTION = 'Uncaught exception - shutting down';
const UNHANDLED_REJECTION = 'Unhandled rejection - shutting down';

// Graceful shutdown handler
const gracefulShutdown = (server, signal) => {
  console.log(`${signal} received - starting graceful shutdown`);
  
  server.close(() => {
    console.log(HTTP_CLOSED);
    
    mongoose.connection.close(false, () => {
      console.log(MONGO_CLOSED);
      process.exit(0);
    });
  });

  // Force close after timeout
  setTimeout(() => {
    console.error(FORCE_SHUTDOWN);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
};

// ⚡ OPTIMIZED: Pre-bind shutdown handlers
const createShutdownHandler = (server, signal) => () => gracefulShutdown(server, signal);

// Configure process event handlers
const configureProcessHandlers = (server) => {
  // ⚡ OPTIMIZED: Pre-create bound handlers
  const sigtermHandler = createShutdownHandler(server, 'SIGTERM');
  const sigintHandler = createShutdownHandler(server, 'SIGINT');
  
  // Handle shutdown signals
  process.on('SIGTERM', sigtermHandler);
  process.on('SIGINT', sigintHandler);

  // ⚡ OPTIMIZED: Inline handlers for exceptions
  process.on('uncaughtException', (err) => {
    console.error(UNCAUGHT_EXCEPTION);
    console.error(err.name, err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error(UNHANDLED_REJECTION);
    console.error(err.name, err.message);
    server.close(() => process.exit(1));
  });
};

module.exports = { gracefulShutdown, configureProcessHandlers };
