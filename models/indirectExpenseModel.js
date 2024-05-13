const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  expenseItems: [
    {
      expenseTitle: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
