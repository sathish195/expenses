const mongoose = require("mongoose");

const commonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    common_name: { type: String, required: true },
    amount: { type: String, required: true },
    group_id: { type: String, required: true },
    due_date: { type: Date, required: true }, 
    admin_ids: { type: [String], required: true },
  },
  { timestamps: true }
);
exports.Common = mongoose.model("Common", commonSchema);


