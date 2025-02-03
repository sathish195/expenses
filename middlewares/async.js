const telegram = require("../helpers/telegram");
module.exports = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res);
      next();
    } catch (ex) {
      telegram.alert_Developers(
        `❌❌❌❌❌❌ \n err in project X route 👉🏻👉🏻👉🏻--> ${req.originalUrl} \n\n ${ex.stack}  \n ❌❌❌❌❌❌`
      );
      return res.status(400).send("Something went wrong..!");
    }
  };
};
