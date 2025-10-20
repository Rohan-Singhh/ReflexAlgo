// ⚡ PRE-WARM DATABASE CONNECTIONS AND CACHES
const mongoose = require('mongoose');

const warmupDatabase = async () => {
  try {
    const User = require('../models/user.model');
    await User.countDocuments({}).exec().catch(() => {});
  } catch (error) {
    // Silent fail - warmup is optional
  }
};

module.exports = warmupDatabase;

