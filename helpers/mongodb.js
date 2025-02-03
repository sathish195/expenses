const mongoose = require("mongoose");
module.exports = () => {
  var connectionString = String(process.env.DBSTRING);
  mongoose
    .connect(connectionString, { autoIndex: true })
    .then((res) => console.log("Connected to ☘️ EXPENSES PROJECT MongoDB...!"))
    .catch((err) => console.log(err));
};
