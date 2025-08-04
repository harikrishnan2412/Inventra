const express = require("express");
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const {
  addOrder,
  markOrderCompleted,
  cancelOrder,
  getAllOrders
} = require("../controllers/orderController");

//add order
router.post("/add",verifyToken, addOrder);

//mark order completed
router.put("/complete/:orderId",verifyToken, markOrderCompleted);

//cancel an order
router.post("/cancel",verifyToken, cancelOrder);

//get all orders
router.get("/getOrders",verifyToken,getAllOrders);

module.exports = router;
