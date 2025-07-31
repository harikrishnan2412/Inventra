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

    const orderIds = orders.map(o => o.id);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
    const totalOrders = orders.length;

    // getting sum of quantity from order_items for today's orders
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("quantity")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    const totalProductsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      totalRevenue,
      totalOrders,
      totalProductsSold
    });

  } catch (err) {
    console.error("Error getting today's sales stats:", err.message);
    res.status(500).json({ error: "Failed to fetch today's sales stats" });
  }
};
