/**
 * Backfill unique usernames for existing users created before public profiles
 * were introduced. Idempotent: only touches users without a username.
 *
 * Usage: npm run migrate:usernames
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');
const { generateUniqueUsername } = require('../utils/username');

async function backfillUsernames() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({
      $or: [{ username: { $exists: false } }, { username: null }, { username: '' }]
    }).select('_id name email username');

    console.log(`Found ${users.length} user(s) without a username.`);

    let updated = 0;
    for (const user of users) {
      // Sequential to guarantee uniqueness against concurrently-assigned names.
      // eslint-disable-next-line no-await-in-loop
      const username = await generateUniqueUsername(User, { name: user.name, email: user.email });
      user.username = username;
      // eslint-disable-next-line no-await-in-loop
      await user.save();
      updated += 1;
      console.log(`  ${user.email} -> @${username}`);
    }

    console.log(`✅ Backfilled ${updated} username(s).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error backfilling usernames:', error);
    process.exit(1);
  }
}

backfillUsernames();
