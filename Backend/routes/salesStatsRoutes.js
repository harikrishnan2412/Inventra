const express = require("express");
const router = express.Router();
const { getTodaySalesStats } = require("../controllers/salesStatsController");

router.get("/total", getTodaySalesStats);

module.exports = router;