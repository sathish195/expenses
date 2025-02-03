const rateLimit = require("express-rate-limit");
module.exports = (time, limit) => {
  return rateLimit({
    windowMs: time, //1 * 60 * 1000,
    max: limit,
    message: "Too many requests from this IP, please try again after some time",
  });
};
