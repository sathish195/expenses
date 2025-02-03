
const mongoose = require('mongoose');

// Define the schema for monthly data
const MonthlyDataSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  categoryData : { type: Object, required: true },
});

// Define the schema for yearly data
const YearlyDataSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  yearAmount: { type: Number, required: true },
  monthlyData: [MonthlyDataSchema],
});

// Define the main schema for group expenses
const GroupExpenseSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  overallTotal: { type: Number, required: true },
  yearlyData: [YearlyDataSchema],
});

// Create the model
exports.GroupExpense = mongoose.model('GroupExpense', GroupExpenseSchema);
