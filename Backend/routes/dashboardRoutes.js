const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { verifyToken } = require('../middleware/authMiddleware');

// Get dashboard statistics and data
router.get("/stats",verifyToken, getDashboardStats);

module.exports = router; 