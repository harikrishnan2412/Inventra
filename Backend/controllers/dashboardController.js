const supabase = require("../database/supabaseClient");

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      console.error("Error fetching total products:", productsError);
      return res.status(500).json({ error: "Failed to fetch total products" });
    }

    // Get total orders count
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (ordersError) {
      console.error("Error fetching total orders:", ordersError);
      return res.status(500).json({ error: "Failed to fetch total orders" });
    }

    // Get recent orders (last 5 orders)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_date,
        total_price,
        status,
        customers (
          name,
          phone_number
        )
      `)
      .order("order_date", { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.error("Error fetching recent orders:", recentOrdersError);
      return res.status(500).json({ error: "Failed to fetch recent orders" });
    }

    // Format recent orders for frontend
    const formattedOrders = recentOrders.map(order => ({
      id: `#ORD${order.id.toString().padStart(3, '0')}`,
      customer: order.customers?.name || 'Anonymous',
      status: order.status,
      amount: order.total_price,
      time: formatTimeAgo(new Date(order.order_date))
    }));

    // Get low stock items (quantity < 10)
    const { data: lowStockItems, error: lowStockError } = await supabase
      .from("products")
      .select("name, quantity")
      .lt("quantity", 10)
      .order("quantity", { ascending: true })
      .limit(5);

    if (lowStockError) {
      console.error("Error fetching low stock items:", lowStockError);
      return res.status(500).json({ error: "Failed to fetch low stock items" });
    }

    // Format low stock items for frontend
    const formattedLowStockItems = lowStockItems.map(item => ({
      name: item.name,
      stock: item.quantity,
      threshold: 10
    }));

    res.json({
      stats: {
        totalProducts,
        totalOrders
      },
      recentOrders: formattedOrders,
      lowStockItems: formattedLowStockItems
    });

  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
} 