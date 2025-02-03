const rateLimit = require("express-rate-limit");
module.exports = rateLimit({
  windowMs: 1 * 1000,
  max: 10,
});
