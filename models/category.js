const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema(
  {
    category_id: { type: String, required: true, unique: true },
    category_name: { type: String, required: true },
    userid: { type: String, required: true },
    group_id: { type: String, required: true},
    // expireAt:{type:Date,default:Date.now,index:{expires:"1"}}
    expireAt: { type: Date, default: Date.now, index: { expires: "1" } },

    
  },
  { timestamps: true }
);
exports.CATEGORY = mongoose.model("CATEGORY", CategorySchema);


// expireAt: {
//   type: Date,
//   default: Date.now, 
// }
