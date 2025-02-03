const telegram = require("./telegram");
require("express-async-errors");
const crypto = require("./crypt");
const rediscon = require("./redisFunctions");
const jwt = require("jsonwebtoken");
module.exports = async function () {
  process.on("unhandledRejection", async (ex) => {
    var user_id = null;
    var user = null;
    if (req.header("x-auth-token")) {
      var token = req.header("x-auth-token");
      const decoded = jwt.verify(
        crypto.decrypt(token),
        process.env.JWTPRIVATEKEY
      );
      user_id = decoded.user_id;
    }
    if (user_id) {
      // const user_check = await rediscon.redisExistCheck(
      //   "projectX_UserData",
      //   user_id
      // );
      // if (user_check) {
      //   const user_get = await rediscon.redisGetData(
      //     "projectX_UserData",
      //     user_id
      //   );
      //   user = user_get.member_name;
      // }
    }

    telegram.alert_Developers(
      `❌❌❌❌❌❌ \n route 👉🏻👉🏻👉🏻--> ${req.originalUrl}  \n\n  🧑🏻‍💼 User Name--->${user}  \n\n  🧑🏻‍💼 user_id--->${user_id} \n\n ${ex.stack} \n ❌❌❌❌❌❌`
    );
  });
};
