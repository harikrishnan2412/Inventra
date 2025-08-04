const express = require("express");
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const {
  getLowStocks
} = require("../controllers/stockMonitorController");

//to get products with quantity below threshold
router.get("/low",verifyToken,getLowStocks);

module.exports = router;
