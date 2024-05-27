const purchaseModel = require("../../models/purchaseModel");
const salesModel = require("../../models/salesModel");
const getPurchaseReportForLast30Days = async (req, res) => {
  try {
    let currentDate, pastDate;

    if (req.body.from && req.body.to) {
      // Use dates provided in the request body
      currentDate = new Date(req.body.to);
      pastDate = new Date(req.body.from);

      // Validate the date range
      if (pastDate > currentDate) {
        return res.status(400).json({
          message:
            "Invalid date range: 'from' date must be earlier than 'to' date",
        });
      }
    } else {
      // Default to the last 30 days
      currentDate = new Date();
      pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);
    }

    // Adjust the dates to the start and end of the day
    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);

    // Log the date range for debugging
    console.log("Current Date:", currentDate);
    console.log("Past Date:", pastDate);

    // Fetch purchase records within the date range
    const purchases = await purchaseModel.find({
      purchaseDate: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    // Fetch sales records within the date range
    const sales = await salesModel.find({
      createdAt: {
        $gte: pastDate,
        $lte: currentDate,
      },
    });

    // Log the fetched purchases and sales for debugging
    console.log("Fetched Purchases:", purchases);
    console.log("Fetched Sales:", sales);

    // Initialize total sums
    let totalPurchasingPrice = 0;
    let totalTransportationCost = 0;
    let totalFinalPrice = 0;

    // Process each purchase to calculate the required sums
    purchases.forEach((purchase) => {
      totalPurchasingPrice += purchase.totalPurchasingPrice;
      totalTransportationCost += purchase.transportationCost;
    });

    // Process each sale to calculate the total final price
    sales.forEach((sale) => {
      totalFinalPrice += sale.finalPrice || 0;
    });

    // Calculate the combined total
    const total = totalPurchasingPrice + totalTransportationCost;

    // Log the calculated totals for debugging
    console.log("Total Purchase Amount:", totalPurchasingPrice);
    console.log("Total Transportation Cost:", totalTransportationCost);
    console.log("Total Final Price from Sales:", totalFinalPrice);
    console.log("Total:", total);

    // Respond with the calculated totals
    res.status(200).json({
      totalPurchasingPrice,
      totalTransportationCost,
      total,
      totalFinalPrice,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
module.exports = {
  getPurchaseReportForLast30Days,
};
