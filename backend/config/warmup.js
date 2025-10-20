// ⚡ PRE-WARM DATABASE CONNECTIONS AND CACHES
const mongoose = require('mongoose');
const { User } = require('../models');

const warmupDatabase = async () => {
  try {
    await User.countDocuments({}).exec().catch(() => {});
  } catch (error) {
    // Silent fail - warmup is optional
  }
};

module.exports = warmupDatabase;

