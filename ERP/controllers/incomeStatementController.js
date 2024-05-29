const Income = require("../../models/incomeModel");
const Expense = require("../../models/indirectExpenseModel");
const purchaseModel = require("../../models/purchaseModel");
const salesModel = require("../../models/salesModel");

const getPurchaseReportForLast30Days = async (req, res) => {
  try {
    let currentDate, pastDate;

    if (req.body.from && req.body.to) {
      currentDate = new Date(req.body.to);
      pastDate = new Date(req.body.from);

      if (pastDate > currentDate) {
        return res.status(400).json({
          message:
            "Invalid date range: 'from' date must be earlier than 'to' date",
        });
      }
    } else {
      currentDate = new Date();
      pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);
    }

    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);

    const purchases = await purchaseModel.find({
      purchaseDate: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    const sales = await salesModel.find({
      createdAt: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    const expenses = await Expense.find({
      created_at: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    const incomeData = await Income.find(); // Fetch all income data

    let totalPurchasingPrice = 0;
    let totalTransportationCost = 0;
    let totalExpenseAmount = 0;
    let expenseItems = [];

    purchases.forEach((purchase) => {
      totalPurchasingPrice += purchase.totalPurchasingPrice || 0;
      totalTransportationCost += purchase.transportationCost || 0;
    });

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

    const totalPurchaseCost = totalPurchasingPrice + totalTransportationCost;
    const netAmount = totalExpenseAmount;

    const otherIncome = incomeData
      .map((income) => ({
        incomeTitle:
          income.incomeItems.length > 0
            ? income.incomeItems[0].incomeTitle
            : "",
        amount:
          income.incomeItems.length > 0 ? income.incomeItems[0].amount : 0,
      }))
      .filter((item) => item.incomeTitle); // filter out empty income items

    const otherIncomeTotalAmount = otherIncome.reduce(
      (total, income) => total + income.amount,
      0
    );

    const netProfit = otherIncomeTotalAmount - netAmount;

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
