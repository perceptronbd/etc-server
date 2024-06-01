const express = require("express");
const {
  getPurchaseReportForLast30Days,
} = require("../controllers/incomeStatementController");
const router = express.Router();

router.post("/income-statement", getPurchaseReportForLast30Days);

module.exports = router;
