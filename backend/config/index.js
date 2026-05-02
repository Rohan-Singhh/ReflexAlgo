// Centralized config exports
import connectDatabase from './database.js';
import configureMiddleware from './middleware.config.js';
import configureRoutes from './routes.config.js';
import { configureProcessHandlers } from './server.config.js';
import warmupDatabase from './warmup.js';

export {
  connectDatabase,
  configureMiddleware,
  configureRoutes,
  configureProcessHandlers,
  warmupDatabase
};

