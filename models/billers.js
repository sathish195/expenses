const mongoose = require("mongoose");

const BillerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  otherCharges: { type: String, required: true, unique: true },
  payload: { type: Object, required: true, unique: true },
});
exports.Biller = mongoose.model("Biller", BillerSchema);
