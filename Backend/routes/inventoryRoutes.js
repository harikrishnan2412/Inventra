const express = require("express");
const InventoryController = require("../controllers/inventoryController");

class InventoryRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/all", InventoryController.getAllProducts);
    this.router.post("/add", InventoryController.addProduct);
    this.router.put("/edit", InventoryController.editProduct);
    this.router.delete("/delete/:code", InventoryController.deleteProductByCode);
  }
}

module.exports = new InventoryRoutes().router;