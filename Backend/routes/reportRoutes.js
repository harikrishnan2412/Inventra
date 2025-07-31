const express = require("express");
const router = express.Router();
const {
  getSalesReportData
} = require("../controllers/reportController");

// data for sales report for a date range
router.get("/sales", getSalesReportData);

module.exports = router;