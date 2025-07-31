const express = require("express");
const router = express.Router();
const {
  getTodaySalesStats,
  getTopProducts,
  getWeeklySalesRevenue,
  getWeeklyProductsSold,
} = require("../controllers/salesStatsController");

router.get("/total", getTodaySalesStats);
router.get("/top-products", getTopProducts);
router.get("/revenue/week", getWeeklySalesRevenue);
router.get("/product/week", getWeeklyProductsSold);

module.exports = router;
