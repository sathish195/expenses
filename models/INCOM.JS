
const mongoose = require("mongoose");
const incomeSchema = new mongoose.Schema(
  {
    t_id: { type: String, required: true },
    user_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    receiver: {  
    receiver_id: { type: String, required: true },
    name: { type: String, required: true },    
    previous_balance: { type: Number,default:0},
    updated_balance: { type: Number, default:0 }, 
    default:{} },
    amount: { type: Number, required: true,default:0 },
    group_name: { type: String, required: true },
    description: { type: String, required: true },
    comment: { type: String, required: true },

    // updated_balence : {type:String,required:true},
    category: {type : String,required:true}, 
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
incomeSchema.index({user_id:1,group_name:1,recever_id:1})
exports.Income = mongoose.model("Income", incomeSchema);
