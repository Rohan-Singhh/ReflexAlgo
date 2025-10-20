const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reflexalgo';
    
    // 🔥 TOP 1% MongoDB optimizations
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 100, // ⚡ EXTREME: Even more connections
      minPoolSize: 20, // ⚡ EXTREME: More warm connections
      socketTimeoutMS: 30000, // ⚡ Faster timeout
      serverSelectionTimeoutMS: 3000, // ⚡ Faster server selection
      family: 4,
      maxIdleTimeMS: 5000, // ⚡ Close idle connections very fast
      compressors: ['zlib'],
      zlibCompressionLevel: 3, // ⚡ Faster compression (less CPU)
      readPreference: 'primaryPreferred',
      retryWrites: true,
      retryReads: true,
      directConnection: false,
      w: 'majority',
      readConcern: { level: 'local' }, // ⚡ Faster reads
      maxConnecting: 10 // ⚡ More parallel connections
    });
    
    console.log('Database connected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('Database error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Database disconnected - attempting reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Database reconnected');
    });

  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;

