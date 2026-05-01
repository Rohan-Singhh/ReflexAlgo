const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reflexalgo';
    
    // 🔥 TOP 1% MongoDB optimizations
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      socketTimeoutMS: 45000, // ⚡ Faster timeout
      serverSelectionTimeoutMS: 10000, // ⚡ Faster server selection
      family: 4,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      autoIndex: process.env.NODE_ENV !== 'production',
      w: 'majority',
      readPreference: 'primary'
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

