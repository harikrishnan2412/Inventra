const express = require("express");
const multer = require("multer");
const InventoryController = require("../controllers/inventoryController");

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

router.get("/all", InventoryController.getAllProducts);
router.post("/add", upload.single("imageFile"), InventoryController.addProduct);
router.put("/edit", upload.single("imageFile"), InventoryController.editProduct);
router.delete("/delete/:code", InventoryController.deleteProductByCode);
router.get("/all/category",InventoryController.getAllCategories);

module.exports = router;
