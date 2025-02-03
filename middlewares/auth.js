const jwt = require("jsonwebtoken");
let jwtPrivateKey = process.env.JWTPRIVATEKEY;
const mongofunctions = require("../helpers/mongofunctions");
const alertDev = require("../helpers/telegram");

async function auth(req, res, next) {
  const tokenEncryped = req.header("Authorization");
  if (!tokenEncryped) {
    return res.status(401).send("Access denied. No Token Provided");
  }
  // const token = tokenEncryped
  const token = tokenEncryped;
  //  console.log(token,"token---->");

  try {
    const decode = jwt.verify(token, jwtPrivateKey);
    // console.log(decode, "decode");
    req.user = decode;
    // validate status
    // find user
    const id = req.user.user_id;
    const response = await mongofunctions.find_one("USER", { user_id: id });
    if (!response) return res.status(400).send("User Not Found in DB");
    // if logout vallidate error
    // if(req.user.device_id !== response.device_id) {
    //   console.log(response.version);
    //   return res.status(401).send("LogOut")}
    console.log("response", "auth");
    if (response.user_active === "Disable") {
      return res.status(401).send("Please Contact Admin");
    }
    next();
  } catch (error) {
    console.log("ttttttt ==>", error);
    alertDev(`Error occurred❌❌❌❌: Invalid Token`);
    return res.status(400).send("Invalid Token");
  }
}

module.exports = auth;
