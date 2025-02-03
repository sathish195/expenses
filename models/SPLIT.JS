const mongoose = require("mongoose");

const splitAmountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    group_id: { type: String, required: true },
    split : []
  },
  { timestamps: true }
);
exports.Split = mongoose.model("Split", splitAmountSchema);


