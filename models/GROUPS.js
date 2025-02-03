const { required } = require("joi");
const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema(
  {
    group_id: { type: String, required: true, unique: true },
    group_name: { type: String, required: true },
    group_balance: { type: Number, required: true,default:0},
    userid: { type: String, required: true },
    group_status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "INACTIVE",
    },
    group_type: {
      type: String,
      required: true,
      enum: ["PERSONAL", "BUSINESS"],
      default: "PERSONAL",
    },
    image: { type: String,default:"0"},
    members_count: {
      type:Number,default : 1,required:true
    },  
    admins_count: {
      type:Number,default : 1,required:true
    },  
    users: { type: Object, default: {} },
    admins: { type: Object, default: {} },
    images: { type: Object, default: {} },
    others: { type: Object, default: {} },
  },
  { timestamps: true }
);
GroupSchema.index({ user_id: 1, phone: 1 });
exports.GROUP = mongoose.model("GROUP", GroupSchema);
