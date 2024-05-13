const Income = require("../../models/incomeModel");

const addIncome = async (req, res) => {
  try {
    const { incomeItems } = req.body;

    if (!Array.isArray(incomeItems) || incomeItems.length === 0) {
      return res.status(400).json({
        message: "Income data should be provided as an array of items.",
      });
    }

    // Validate each income item
    for (const item of incomeItems) {
      if (
        typeof item.incomeTitle !== "string" ||
        typeof item.amount !== "number" ||
        item.amount < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid data. Please ensure all income items have properly formatted fields.",
        });
      }
    }

    // Create a new Income instance with the provided data
    const newIncome = new Income({ incomeItems });

    // Save the new record to the database
    await newIncome.save();

    // Return a success response
    res.status(201).json({
      message: "Income created successfully",
      data: newIncome,
    });
  } catch (error) {
    console.error("Error creating income:", error);
    res.status(500).json({
      message:
        "An error occurred while creating the income. Please try again later.",
    });
  }
};

module.exports = { addIncome };
