const Income = require("../../models/incomeModel");
const Expense = require("../../models/indirectExpenseModel");
const purchaseModel = require("../../models/purchaseModel");
const salesModel = require("../../models/salesModel");

const getPurchaseReportForLast30Days = async (req, res) => {
  try {
    let currentDate, pastDate;

    // Check if custom date range is provided
    if (req.body.from && req.body.to) {
      currentDate = new Date(req.body.to);
      pastDate = new Date(req.body.from);

      // Validate date range
      if (pastDate > currentDate) {
        return res.status(400).json({
          message:
            "Invalid date range: 'from' date must be earlier than 'to' date",
        });
      }
    } else {
      // Default to last 30 days if no date range provided
      currentDate = new Date();
      pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);
    }

    // Normalize the dates to include the full range of days
    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);

    // Fetch purchases within the date range
    const purchases = await purchaseModel.find({
      purchaseDate: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    // Fetch sales within the date range
    const sales = await salesModel.find({
      createdAt: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    // Fetch expenses within the date range
    const expenses = await Expense.find({
      created_at: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    // Fetch all income data
    const incomeData = await Income.find();

    // Variables to hold the totals
    let totalPurchasingPrice = 0;
    let totalTransportationCost = 0;
    let totalExpenseAmount = 0;
    let expenseItems = [];

    // Calculate total purchasing price and transportation cost from purchases
    purchases.forEach((purchase) => {
      totalPurchasingPrice += purchase.totalPurchasingPrice || 0;
      totalTransportationCost += purchase.transportationCost || 0;
    });

    // Calculate total expense amount and aggregate expense items
    expenses.forEach((expense) => {
      expense.expenseItems.forEach((item) => {
        totalExpenseAmount += item.amount;
        expenseItems.push({
          expenseTitle: item.expenseTitle,
          amount: item.amount,
          _id: item._id,
        });
      });
    });

    // Calculate total purchase cost
    const totalPurchaseCost = totalPurchasingPrice + totalTransportationCost;
    const netAmount = totalExpenseAmount;

    // Aggregate other income items
    const otherIncome = incomeData
      .map((income) => ({
        incomeTitle:
          income.incomeItems.length > 0
            ? income.incomeItems[0].incomeTitle
            : "",
        amount:
          income.incomeItems.length > 0 ? income.incomeItems[0].amount : 0,
      }))
      .filter((item) => item.incomeTitle); // Filter out empty income items

    // Calculate total amount of other income
    const otherIncomeTotalAmount = otherIncome.reduce(
      (total, income) => total + income.amount,
      0
    );

    // Calculate net profit
    const netProfit = otherIncomeTotalAmount - netAmount;

    // Send the response with calculated financial details
    res.status(200).json({
      totalPurchasingPrice,
      totalTransportationCost,
      totalPurchaseCost,
      expenses: expenseItems,
      totalIndirectExpense: netAmount,
      otherIncome,
      otherIncomeTotalAmount,
      netProfit,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = {
  getPurchaseReportForLast30Days,
};
