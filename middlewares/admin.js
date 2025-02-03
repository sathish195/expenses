const { alertDev } = require("../helpers/telegram");
// const redis = require("../helpers/redis");
const mongofunctions = require("../helpers/mongofunctions");

module.exports = async (req, res, next) => {
  try {
    // validate admin
    console.log(req.user,"admin--------->");
    if (req.user.user_type !== "ADMIN"
    )
      return res
        .status(403)
        .send("You're Unauthorized To Process Current Request");
    let admin = await mongofunctions.find_one("USER",{user_id: req.user.user_id,});
    if (!admin) return res.status(400).send("No Account Found!");
    req.admin = admin;
    next(); 
  } catch (err) {
    alertDev(err);
    return res.status(500).send(err.message);
  }
};
