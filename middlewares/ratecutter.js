const slowDown = require("express-slow-down");

module.exports = slowDown({
  windowMs: 1 * 1000, //1 seconds
  delayAfter: 1, //allow 1 req for 1 seconds
  delayMs: 2 * 1000, //after that add 2 seconds
  keyGenerator: function (req /*, res*/) {
    return req.user.user_id;
  },
  onLimitReached: function (req, res, options) {
    return "user limit reached";
  },
});
