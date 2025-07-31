const supabase = require("../database/supabaseClient");

exports.addOrder = async (req, res) => {
  try {
    const { total_price, phone_no, name, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Product list is empty" });
    }

    // 1. Fetch all product details using 'code'
    const codes = products.map((p) => p.code);
    const { data: dbProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, code, price, quantity")
      .in("code", codes);

    if (fetchError) {
      return res.status(500).json({ error: "Failed to fetch product data" });
    }

    // 2. Match products and check quantity and price
    let calculatedTotal = 0;
    const orderItems = [];

    for (const p of products) {
      const dbProduct = dbProducts.find((dp) => dp.code === p.code);
      if (!dbProduct) {
        return res
          .status(400)
          .json({ error: `Product with code ${p.code} not found` });
      }

      if (p.quantity > dbProduct.quantity) {
        return res.status(400).json({
          error: `Only ${dbProduct.quantity} units available for product ${p.code}`,
        });
      }

      const price = dbProduct.price;
      calculatedTotal += price * p.quantity;

      orderItems.push({
        product_id: dbProduct.id,
        quantity: p.quantity,
      });
    }

    // 3. Verify total price
    if (parseFloat(calculatedTotal.toFixed(2)) !== parseFloat(total_price)) {
      return res.status(400).json({
        error: `Total price mismatch. Expected: ${calculatedTotal}`,
      });
    }

    // 4. Handle customer
    let customerId;
    if (phone_no) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone_number", phone_no)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerInsertError } = await supabase
          .from("customers")
          .insert([{ phone_number: phone_no, name: name || "" }])
          .select()
          .single();

        if (customerInsertError) {
          return res.status(500).json({ error: "Failed to create customer" });
        }

        customerId = newCustomer.id;
      }
    }

    // 5. Insert order
    const orderInsert = {
      customer_id: customerId || null,
      status: "pending",
      total_price: total_price,
      order_date: new Date().toISOString(),
    };

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([orderInsert])
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    const orderId = orderData.id;

    // 6. Insert order items and update product quantities
    const orderItemsInsert = orderItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsInsert);

    if (orderItemsError) {
      return res.status(500).json({ error: "Failed to create order items" });
    }

    // 7. Update product quantities directly
    for (const item of orderItems) {
      const dbProduct = dbProducts.find((p) => p.id === item.product_id);
      const newQuantity = dbProduct.quantity - item.quantity;

      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", item.product_id);

      if (updateError) {
        return res.status(500).json({
          error: `Failed to update quantity for product ID ${item.product_id}`,
        });
      }
    }

    return res
      .status(201)
      .json({ message: "Order placed successfully", order_id: orderId });
  } catch (err) {
    console.error("Error in addOrder:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markOrderCompleted = async (req, res) => {
  const { orderId } = req.params;

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (findError || !order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status === 'completed') {
    return res.status(400).json({ error: 'Order already marked as completed' });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }

  res.json({ message: 'Order marked as completed' });
};

exports.cancelOrder = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    // Step 1: Validate order exists and check status
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", order_id)
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (orderData.status === "cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    if (orderData.status === "completed") {
      return res.status(400).json({ error: "Completed orders cannot be cancelled" });
    }

    // Step 2: Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", order_id);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return res.status(404).json({ error: "Order items not found" });
    }

    // Step 3: Update each product quantity
    for (const item of orderItems) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }

      const newQuantity = product.quantity + item.quantity;

      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", item.product_id);

      if (updateError) {
        return res.status(500).json({ error: "Failed to update product quantity" });
      }
    }

    // Step 4: Update order status
    const { error: cancelError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    if (cancelError) {
      return res.status(500).json({ error: "Failed to cancel the order" });
    }

    return res.status(200).json({ message: "Order successfully cancelled and inventory updated." });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_date,
        total_price,
        status,
        customers (
          id,
          name,
          phone_number
        ),
        order_items (
          quantity,
          products (
            id,
            name,
            code,
            price,
            image_url
          )
        )
      `)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    const formatted = orders.map((order) => ({
      order_id: order.id,
      order_date: order.order_date,
      total_price: order.total_price,
      status: order.status,
      customer: order.customers
        ? {
            id: order.customers.id,
            name: order.customers.name,
            phone_number: order.customers.phone_number,
          }
        : null,
      items: order.order_items.map((item) => ({
        product_id: item.products.id,
        name: item.products.name,
        code: item.products.code,
        price: item.products.price,
        image_url: item.products.image_url,
        quantity: item.quantity,
      })),
    }));

    return res.status(200).json({ orders: formatted });
  } catch (err) {
    console.error("Unhandled error in getAllOrders:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};