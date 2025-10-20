const dotenv = require('dotenv');

// Load environment variables FIRST (before any other imports)
dotenv.config();

const app = require('./app');
const connectDatabase = require('./config/database');
const warmupDatabase = require('./config/warmup');
const { configureProcessHandlers } = require('./config/server.config');

const PORT = process.env.PORT || 5000;

// Connect to Database + Pre-warm connections
connectDatabase().then(async () => {
  await warmupDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  configureProcessHandlers(server);
}).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});

