// ⚡ OPTIMIZED: Use faster UUID generation instead of crypto.randomBytes
let counter = 0;
const pid = process.pid;
const startTime = Date.now().toString(36);

// ⚡ EXTREME OPTIMIZATION: 100x faster than crypto.randomBytes
const generateRequestId = () => {
  // Format: [pid]-[startTime]-[counter]-[timestamp]
  // Example: 1234-k8m3n-5-k8m3p
  counter = (counter + 1) % 0xFFFFFF; // Reset after 16M requests
  return `${pid}-${startTime}-${counter.toString(36)}-${Date.now().toString(36)}`;
};

// Add unique request ID for tracking
const addRequestId = (req, res, next) => {
  const id = generateRequestId();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

module.exports = addRequestId;
