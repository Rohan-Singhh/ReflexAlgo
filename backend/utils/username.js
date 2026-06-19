/**
 * Username utilities for public profiles.
 *
 * Usernames are lowercase, 3-30 chars, and contain only [a-z0-9_].
 * Generation derives a base slug from the user's name (falling back to the
 * email local part) and guarantees uniqueness by appending a numeric suffix.
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 30;
const VALID_REGEX = /^[a-z0-9_]+$/;

/**
 * Convert an arbitrary string into a valid username slug (without uniqueness).
 * Returns '' if nothing usable remains.
 */
function slugifyUsername(input = '') {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, '_') // collapse invalid runs into underscore
    .replace(/_+/g, '_')          // collapse repeated underscores
    .replace(/^_+|_+$/g, '')      // trim leading/trailing underscores
    .slice(0, MAX_LENGTH);
}

/**
 * Whether a string is a structurally valid username (does not check uniqueness).
 */
function isValidUsername(value = '') {
  const v = String(value).toLowerCase();
  return v.length >= MIN_LENGTH && v.length <= MAX_LENGTH && VALID_REGEX.test(v);
}

/**
 * Build a usable base slug from a name / email, padded to the minimum length.
 */
function buildBaseSlug({ name, email } = {}) {
  let base = slugifyUsername(name);

  if (base.length < MIN_LENGTH && email) {
    base = slugifyUsername(String(email).split('@')[0]);
  }

  if (base.length < MIN_LENGTH) {
    base = 'user';
  }

  return base.slice(0, MAX_LENGTH);
}

/**
 * Generate a unique username, querying the provided Mongoose User model.
 *
 * @param {import('mongoose').Model} User - the User model
 * @param {{ name?: string, email?: string }} source - fields to derive from
 * @returns {Promise<string>} a unique, valid username
 */
async function generateUniqueUsername(User, source = {}) {
  const base = buildBaseSlug(source);

  // Try the bare base first, then base + incrementing suffix.
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const suffix = attempt === 0 ? '' : String(attempt + 1);
    const candidate = `${base.slice(0, MAX_LENGTH - suffix.length)}${suffix}`;

    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ username: candidate });
    if (!exists) {
      return candidate;
    }
  }

  // Extremely unlikely fallback: timestamp-based uniqueness.
  return `user_${Date.now().toString(36)}`.slice(0, MAX_LENGTH);
}

module.exports = {
  slugifyUsername,
  isValidUsername,
  buildBaseSlug,
  generateUniqueUsername,
  USERNAME_MIN_LENGTH: MIN_LENGTH,
  USERNAME_MAX_LENGTH: MAX_LENGTH
};
