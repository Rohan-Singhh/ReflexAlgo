const dotenv = require('dotenv');

// Load environment variables FIRST (before any other imports)
dotenv.config();

const app = require('./app');
const { connectDatabase, warmupDatabase, configureProcessHandlers } = require('./config');
const ensureIndexes = require('./utils/ensureIndexes');
const { cacheWarmer } = require('./utils');

const PORT = process.env.PORT || 5000;

// Connect to Database + Optimize + Pre-warm connections
connectDatabase().then(async () => {
  // ⚡ Ensure database indexes for max performance
  await ensureIndexes();
  
  // ⚡ Pre-warm database connections
  await warmupDatabase();
  
  // ⚡ Warm global cache for faster first requests
  await cacheWarmer.warmGlobalCache();
  
  // ⚡ Schedule periodic cache warming for hot data
  cacheWarmer.schedulePeriodicWarming();

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  configureProcessHandlers(server);
}).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});

