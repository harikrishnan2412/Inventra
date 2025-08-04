const express = require("express");
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const {
  getSalesReportData
} = require("../controllers/reportController");

// data for sales report for a date range
router.get("/sales",verifyToken, getSalesReportData);

module.exports = router;