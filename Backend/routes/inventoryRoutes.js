const express = require("express");
const multer = require("multer");
const InventoryController = require("../controllers/inventoryController");
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "../uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

//get all products 
router.get("/all",verifyToken, InventoryController.getAllProducts);

//add a product
router.post("/add",verifyToken, upload.single("imageFile"), InventoryController.addProduct);

//edit a product 
router.put("/edit/:code",verifyToken, InventoryController.editProduct);

//delete a product
router.delete("/delete/:code",verifyToken, InventoryController.deleteProductByCode);

//get all categories and its ids from db
router.get("/all/category",verifyToken,InventoryController.getAllCategories);

module.exports = router;
