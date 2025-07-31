const express = require("express");
const router = express.Router();
const {
  getLowStocks
} = require("../controllers/stockMonitorController");

//to get products with quantity below threshold
router.get("/low",getLowStocks);

module.exports = router;
