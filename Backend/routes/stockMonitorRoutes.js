const express = require("express");
const router = express.Router();
const {
  getLowStocks
} = require("../controllers/stockMonitorController");

router.get("/low",getLowStocks);

module.exports = router;
