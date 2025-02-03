
const { required } = require("joi");
const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    t_id: { type: String, required: true },
    user_id: { type: String, required: true },
    added_by: { type: String, required: true },
    amount: { type: Number, required: true },
    group_name: { type: String, required: true },
    description: { type: String, required: true },
    comment: { type: String, required: true },
    name: { type: String, required: true },    
    previous_balance: { type: Number,default:0},
    updated_balance: { type: Number, default:0 }, 
    category: {type : String,required:true},
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
TransactionSchema.index({ user_id: 1, group_name: 1 });

exports.Expenses = mongoose.model("Expenses", TransactionSchema);
