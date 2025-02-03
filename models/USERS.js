const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    user_email: { type: String, required: true, unique: true },
    user_profile: { type: String, required: true, unique: true },
    user_name: { type: String, required: true, unique: true },
    // id_status: {
    //   type: String,
    //   required: true,
    //   enum: ["ACTIVE", "INACTIVE", "UNVERIFIED"],
    //   default: "UNVERIFIED",
    // },
    user_type: { type: String, required: true, default: "USER" },
    date_of_registration: { type: Date, default: Date.now },
    groups: { type: Object, default: {} },
    // last_login_ip: { type: String, required: true },
    // user_status: {
    //   type: String,
    //   enum: ["ENABLE", "DISABLE", "UNVERIFIED"],
    //   default: "UNVERIFIED",
    // },
    // images: { type: Object, default: {} },

    // images: { type: Object, default: {} },
    // profile: { type: Object, default: {} },
    // others: { type: Object, default: {} },
  },
  { timestamps: true }
);
UserSchema.index({ user_id: 1, user_name: 1 });
exports.USER = mongoose.model("USER", UserSchema);
