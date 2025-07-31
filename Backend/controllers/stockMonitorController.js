const supabase = require("../database/supabaseClient");

// API for finding products with quantity lower than threshold value (Currently hardcoded as 5)
exports.getLowStocks = async (req, res) => {
  try {
    const THRESHOLD = 5;

    const { data: lowStockItems, error } = await supabase
      .from("products")
      .select("code, name, quantity")
      .lt("quantity", THRESHOLD)                        
      .order("quantity", { ascending: true });          

    if (error) {
      console.error("Error fetching low stock products:", error);
      return res.status(500).json({ error: "Failed to fetch low stock products" });
    }

    const result = {
      count: lowStockItems.length,
      items: lowStockItems,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Unhandled error in getLowStocks:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
