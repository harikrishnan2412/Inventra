const express = require("express");
const router = express.Router();
const {
  addOrder,
  markOrderCompleted,
  cancelOrder,
  getAllOrders
} = require("../controllers/orderController");

//add order
router.post("/add", addOrder);

//mark order completed
router.put("/complete/:orderId", markOrderCompleted);

//cancel an order
router.post("/cancel", cancelOrder);

//get all orders
router.get("/getOrders",getAllOrders);

module.exports = router;
