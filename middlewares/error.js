const teleg = require("../helpers/telegram");
const crypto = require("../helpers/crypt");
const rediscon = require("../helpers/redisFunctions");
const jwt = require("jsonwebtoken");

module.exports = async function (err, req, res, next) {
  var user_id = null;
  var user = null;
  if (req.header("Authorization")) {
    var token = req.header("Authorization");
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
    //   const user_get = await rediscon.redisGetData("projectX_UserData", user_id);
    //   user = user_get.member_name;
    // }
  }
  teleg.alert_Developers(
    `❌❌❌❌❌❌ \n route 👉🏻👉🏻👉🏻--> ${req.originalUrl}  \n\n  🧑🏻‍💼 User Name--->${user}  \n\n  🧑🏻‍💼 user_id--->${user_id} \n\n ${err.stack} \n ❌❌❌❌❌❌`
  );
  return res.status(400).send("JSON Format Error !!");
};
