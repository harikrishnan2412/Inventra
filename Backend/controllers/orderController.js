const supabase = require("../database/supabaseClient");

exports.addOrder = async (req, res) => {
  try {
    const { total_price, phone_no, name, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Product list is empty' });
    }

    const codes = products.map((p) => p.code);
    const { data: dbProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, code, price, quantity') 
      .in('code', codes);

    if (fetchError) {
      console.error('Fetch Product Error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch product data'+fetchError });
    }

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

    if (parseFloat(calculatedTotal.toFixed(2)) !== parseFloat(total_price)) {
      return res.status(400).json({
        error: `Total price mismatch. Expected: ${calculatedTotal.toFixed(2)}, Got: ${total_price}`,
      });
    }

    let customerId;
    if (phone_no) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', phone_no)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerInsertError } = await supabase
          .from('customers')
          .insert([{ phone_number: phone_no, name: name || '' }])
          .select('id')
          .single();

        if (customerInsertError) {
          console.error('Customer Insert Error:', customerInsertError);
          return res.status(500).json({ error: 'Failed to create customer' });
        }
        customerId = newCustomer.id;
      }
    }


    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId || null,
        status: 'pending',
        total_price: total_price,
        order_date: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order Insert Error:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }
    const orderId = orderData.id;

    const orderItemsInsert = orderItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsInsert);

    if (orderItemsError) {
      console.error('Order Items Insert Error:', orderItemsError);

      await supabase.from('orders').delete().eq('id', orderId);
      return res.status(500).json({ error: 'Failed to create order items' });
    }
    return res
      .status(201)
      .json({ message: 'Order placed successfully', order_id: orderId });
  } catch (err) {
    console.error('Error in addOrder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markOrderCompleted = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Find the order and its items
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select(`
        id, 
        status,
        order_items ( product_id, quantity )
      `)
      .eq('id', orderId)
      .single();

    if (findError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Check the order status
    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Order is already marked as completed' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot complete a cancelled order' });
    }

    // 3. Deduct stock for each item in the order
    for (const item of order.order_items) {
      // Get the current stock of the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        return res.status(500).json({ error: `Could not find product with ID ${item.product_id}` });
      }

      const newQuantity = product.quantity - item.quantity;

      // Update the product's stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', item.product_id);

      if (updateError) {
        console.error(`Failed to update stock for product ${item.product_id}:`, updateError);
        return res.status(500).json({ error: "Failed to update product stock. Order status not changed." });
      }
    }

    // 4. Update the order status to 'completed'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (updateError) {
      console.error('CRITICAL: Stock deducted but failed to update order status for order ID:', orderId, updateError);
      return res.status(500).json({ error: 'Failed to update order status after deducting stock.' });
    }

    res.json({ message: 'Order marked as completed and inventory updated.' });
  } catch(err) {
    console.error('Unhandled error in markOrderCompleted:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // 1. Find the order
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .single();

    if (findError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Check if the order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ error: `Order is already ${order.status} and cannot be cancelled.` });
    }

    // 3. Update the order status to 'cancelled'
    const { error: cancelError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order_id);

    if (cancelError) {
      return res.status(500).json({ error: 'Failed to cancel the order.' });
    }

    return res.status(200).json({ message: 'Order successfully cancelled.' });
  } catch (err) {
    console.error('Unexpected error during cancellation:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
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
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
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
    console.error('Unhandled error in getAllOrders:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};