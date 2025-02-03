require("dotenv").config();
const express = require("express");
const axios = require("axios")
const app = express();
app.enable("trust proxy");
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
require("./helpers/production")(app);
require("./helpers/unhandled_errors")();
require("./helpers/mongodb")();
require("./helpers/redisFunctions");
require("./helpers/routes")(app);

// require("./helpers/corn")

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`USER ExPENSES Project ---1> Listening on port 🚀 ${port} ...`);
});
                 