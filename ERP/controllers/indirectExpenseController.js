const Expense = require("../../models/indirectExpenseModel");

const addExpense = async (req, res) => {
  try {
    // Extract fields from the request body
    const { expenseItems } = req.body;

    if (!Array.isArray(expenseItems) || expenseItems.length === 0) {
      return res.status(400).json({
        message: "Expense data should be provided as an array of items.",
      });
    }

    // Validate each expense item
    for (const item of expenseItems) {
      if (
        typeof item.expenseTitle !== "string" ||
        typeof item.amount !== "number" ||
        item.amount < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid data. Please ensure all expense items have properly formatted fields.",
        });
      }
    }

    // Create a new Expense instance with the provided data
    const newExpense = new Expense({ expenseItems });

    // Save the new record to the database
    await newExpense.save();

    // Return a success response
    res.status(201).json({
      message: "Expense created successfully",
      data: newExpense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      message:
        "An error occurred while creating the expense. Please try again later.",
    });
  }
};

module.exports = { addExpense };
