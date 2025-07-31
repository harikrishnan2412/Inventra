const express = require("express");
const router = express.Router();
const {
  getTodaySalesStats,
  getTopProducts,
  getWeeklySalesRevenue,
  getWeeklyProductsSold,
} = require("../controllers/salesStatsController");

//api for getting total revenue, total products, total orders for the dashboard
router.get("/total", getTodaySalesStats);

//api for getting top 3 products daily and weekly
router.get("/top-products", getTopProducts);

//return total revenue for each day in last week
router.get("/revenue/week", getWeeklySalesRevenue);

//return total product for each day in last week
router.get("/product/week", getWeeklyProductsSold);

module.exports = router;
