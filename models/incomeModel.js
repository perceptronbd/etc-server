const mongoose = require("mongoose");

// Define the Income schema
const IncomeSchema = new mongoose.Schema({
  incomeItems: [
    {
      incomeTitle: {
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
const Income = mongoose.model("Income", IncomeSchema);

module.exports = Income;
