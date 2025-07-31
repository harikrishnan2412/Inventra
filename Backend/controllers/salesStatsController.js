const supabase = require("../database/supabaseClient");

exports.getTodaySalesStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // current day's completed orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_price")
      .eq("status", "completed")
      .gte("order_date", todayStart.toISOString())
      .lte("order_date", todayEnd.toISOString());

    if (ordersError) throw ordersError;

    const orderIds = orders.map((o) => o.id);
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_price),
      0
    );
    const totalOrders = orders.length;

    // getting sum of quantity from order_items for today's orders
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("quantity")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    const totalProductsSold = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.json({
      totalRevenue,
      totalOrders,
      totalProductsSold,
    });
  } catch (err) {
    console.error("Error getting today's sales stats:", err.message);
    res.status(500).json({ error: "Failed to fetch today's sales stats" });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const getTopProductsByDateRange = async (fromDate, toDate) => {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "completed")
        .gte("order_date", fromDate.toISOString())
        .lte("order_date", toDate.toISOString());

      if (ordersError) throw ordersError;

      const orderIds = orders.map((o) => o.id);
      if (orderIds.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      const quantityMap = {};
      items.forEach((item) => {
        quantityMap[item.product_id] =
          (quantityMap[item.product_id] || 0) + item.quantity;
      });

      const sortedProductIds = Object.entries(quantityMap)
        .sort((a, b) => b[1] - a[1]) // sort descending by quantity
        .slice(0, 3); // top 3

      // Get product details
      const topProductIds = sortedProductIds.map(([id]) => Number(id));
      if (topProductIds.length === 0) return [];

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, code, name")
        .in("id", topProductIds);

      if (productsError) throw productsError;

      return products.map((p) => ({
        code: p.code,
        name: p.name,
        totalQuantitySold: quantityMap[p.id] || 0,
      }));
    };

    const topToday = await getTopProductsByDateRange(todayStart, now);
    const topWeek = await getTopProductsByDateRange(weekAgo, now);

    res.json({
      topToday,
      topWeek,
    });
  } catch (err) {
    console.error("Error fetching top products:", err.message);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};
