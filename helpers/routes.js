const express = require("express");
const error = require("../middlewares/error");
const queue = require("express-queue");
const user = require('../routes/user/user');
const billers = require('../routes/user/billers');
// const user = require("../routes/user/user");
// const user_get = require("../routes/user/userget");
// const payments = require("../routes/user/payments");
module.exports = (app) => {
  app.use(express());
  app.get("/", async (req, res) => {
    return res.status(200).send(" Hello, Welcome to EXPENSES PROJECT 🚀 ");
  });
  app.use('/user', user, queue({ activeLimit: 1, queuedLimit: -1 }));
  app.use('/user', billers, queue({ activeLimit: 1, queuedLimit: -1 }));
  // app.use("/user", user, queue({ activeLimit: 1, queuedLimit: -1 }));
  // app.use("/user_get", user_get, queue({ activeLimit: 1, queuedLimit: -1 }));
  // app.use("/payments", payments, queue({ activeLimit: 1, queuedLimit: -1 }));
  app.use(error);
};
