// Centralized config exports
const connectDatabase = require('./database');
const configureMiddleware = require('./middleware.config');
const configureRoutes = require('./routes.config');
const { configureProcessHandlers } = require('./server.config');
const warmupDatabase = require('./warmup');

module.exports = {
  connectDatabase,
  configureMiddleware,
  configureRoutes,
  configureProcessHandlers,
  warmupDatabase
};

