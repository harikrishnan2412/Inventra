const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../storage/cloudinaryClient");
const supabase = require("../database/supabaseClient");
const fs = require("fs");

function generateSkuCode() {
  return uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
}

const InventoryController = {
  // GET 
  async getAllProducts(req, res) {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      console.error("Unhandled error in getAllProducts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // GET Categories
  async getAllCategories(req,res){
    try{
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch(err){
      console.error("Unhandled error in getAllCategories:",err);
      res.status(500).json({error:err.message})
    }
  },

  // POST
  async addProduct(req, res) {
    try {
      const { name, price, quantity, category_id } = req.body;
      const imageFile = req.file;

      if (!name || !price || !quantity || !category_id) {
        return res.status(400).json({
          error: "Missing required fields: name, price, quantity, category_id",
        });
      }

      const parsedPrice = parseFloat(price);
      const parsedQuantity = parseInt(quantity, 10);
      const parsedCategoryId = parseInt(category_id, 10);

      if (
        isNaN(parsedPrice) ||
        isNaN(parsedQuantity) ||
        isNaN(parsedCategoryId)
      ) {
        return res.status(400).json({
          error: "Invalid numeric values for price, quantity, or category_id",
        });
      }

      // SKU and image
      const skuCode = generateSkuCode();
      let imageUrl = null;

      if (imageFile) {
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: "Inventra",
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(imageFile.path);
      }

      const { data, error } = await supabase.from("products").insert([
        {
          name,
          price: parsedPrice,
          quantity: parsedQuantity,
          category_id: parsedCategoryId,
          image_url: imageUrl,
          code: skuCode,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({ message: "Product added successfully", data });
    } catch (err) {
      console.error("Unhandled error in addProduct:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // PUT
  async editProduct(req, res) {
    try {
      const { code, name, price, quantity, category_id } = req.body;
      const imageFile = req.file;

      if (!code) {
        return res.status(400).json({ error: "Missing required field: code" });
      }

      const updateFields = {};
      if (name) updateFields.name = name;
      if (price) {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
          return res.status(400).json({ error: "Invalid price" });
        }
        updateFields.price = parsedPrice;
      }
      if (quantity) {
        const parsedQty = parseInt(quantity, 10);
        if (isNaN(parsedQty)) {
          return res.status(400).json({ error: "Invalid quantity" });
        }
        updateFields.quantity = parsedQty;
      }
      if (category_id) {
        const parsedCat = parseInt(category_id, 10);
        if (isNaN(parsedCat)) {
          return res.status(400).json({ error: "Invalid category_id" });
        }
        updateFields.category_id = parsedCat;
      }

      if (imageFile) {
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: "Inventra",
        });
        updateFields.image_url = result.secure_url;
        fs.unlinkSync(imageFile.path);
      }

      const { data, error } = await supabase
        .from("products")
        .update(updateFields)
        .eq("code", code);

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ message: "Product updated successfully", data });
    } catch (err) {
      console.error("Unhandled error in editProduct:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /products/:code
  async deleteProductByCode(req, res) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({ error: "Missing product code" });
      }

      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("code", code);

      if (error) {
        console.error("Supabase delete error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ message: "Product deleted successfully", data });
    } catch (err) {
      console.error("Unhandled error in deleteProductByCode:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = InventoryController;
