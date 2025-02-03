const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  comment: { type: String, required: true }
},
{_id:false}

);

const paymentSchema = new mongoose.Schema({
  t_pid: { type: String, required: true },
  group_id: { type: String, required: true },
  paid_by: { type: String, required: true },
  amount: { type: Number, required: true },
  split: [splitSchema]
});


exports.Payment = mongoose.model("Payment", paymentSchema);

