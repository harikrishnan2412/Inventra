const express = require("express");
const router = express.Router();
const {
  addOrder,
  markOrderCompleted,
  cancelOrder,
  getAllOrders
} = require("../controllers/orderController");

router.post("/add", addOrder);
router.post("/complete", markOrderCompleted);
router.post("/cancel", cancelOrder);
router.get("/getOrders",getAllOrders);

module.exports = router;
