const express = require("express");
const router = express.Router();
const { getTodaySalesStats, getTopProducts} = require("../controllers/salesStatsController");

router.get("/total", getTodaySalesStats);
router.get("/top-products", getTopProducts);

module.exports = router;