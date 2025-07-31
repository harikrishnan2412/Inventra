const supabase = require("../database/supabaseClient");

exports.getSalesReportData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "fromDate and toDate are required" });
    }

    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_price, status, order_date")
      .gte("order_date", start.toISOString())
      .lte("order_date", end.toISOString());

    if (ordersError) throw ordersError;

    let totalRevenue = 0;
    let totalCompletedOrders = 0;
    let totalCancelledOrders = 0;
    const orderIdMap = [];
    const dailyMap = {};

    for (const order of orders) {
      const dateKey = new Date(order.order_date).toISOString().split("T")[0];

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          revenue: 0,
          totalOrders: 0,
        };
      }

      if (order.status === "completed") {
        const revenue = Number(order.total_price || 0);
        totalRevenue += revenue;
        totalCompletedOrders += 1;
        dailyMap[dateKey].revenue += revenue;
        dailyMap[dateKey].totalOrders += 1;
        orderIdMap.push(order.id);
      } else if (order.status === "cancelled") {
        totalCancelledOrders += 1;
      }
    }

    let totalProductsSold = 0;

    if (orderIdMap.length > 0) {
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity")
        .in("order_id", orderIdMap);

      if (itemsError) throw itemsError;

      totalProductsSold = orderItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
    }

    const dailyBreakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        totalOrders: stats.totalOrders,
      }));

    res.json({
      fromDate,
      toDate,
      totalRevenue,
      totalCompletedOrders,
      totalCancelledOrders,
      totalProductsSold,
      dailyBreakdown,
    });
  } catch (err) {
    console.error("Error fetching sales report data:", err.message);
    res.status(500).json({ error: "Failed to fetch sales report data" });
  }
};
