const { required } = require("joi");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    t_id: { type: String, required: true },
    user_id: { type: String, required: true },
    added_by: { type: String },
    amount: { type: Number, required: true, default: 0 },
    group_id: { type: String, required: true },
    description: { type: String, required: true },
    comment: { type: String, required: true },
    name: { type: String,},
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    updated_date: { type: String },
    group_balance: { type: Number, required:true},
    // type: { type: String, enum: ['expense', 'income'], required: true }, // added type field
    sender_id: { type: String }, // optional for income
    receiver: {
      receiver_id: { type: String }, // optional for income
      name: { type: String }, // optional for income
      previous_balance: { type: Number, default: 0 },
      updated_balance: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Create index for better query performance
transactionSchema.index({ user_id: 1, group_name: 1, type: 1 });

exports.Transaction = mongoose.model("Transaction", transactionSchema);
