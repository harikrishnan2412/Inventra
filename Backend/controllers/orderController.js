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
      .select('id, code, price, quantity_in_stock') 
      .in('code', codes);

    if (fetchError) {
      console.error('Fetch Product Error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch product data' });
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

      if (p.quantity > dbProduct.quantity_in_stock) { 
        return res.status(400).json({
          error: `Only ${dbProduct.quantity_in_stock} units available for product ${p.code}`,
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

    for (const item of orderItems) {
      const dbProduct = dbProducts.find((p) => p.id === item.product_id);
      const newQuantity = dbProduct.quantity_in_stock - item.quantity; 

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity_in_stock: newQuantity }) 
        .eq('id', item.product_id);

      if (updateError) {
        console.error(`CRITICAL: Failed to update quantity for product ID ${item.product_id}. Order ID: ${orderId}`);
      }
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
      return res.status(400).json({ error: 'Order is already marked as completed' });
    }

     if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot complete a cancelled order' });
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
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderData.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }
    if (orderData.status === 'completed') {
      return res.status(400).json({ error: 'Completed orders cannot be cancelled' });
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order_id);

    if (itemsError) {
        return res.status(500).json({ error: "Failed to fetch order items for cancellation." });
    }

    if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
            // Use Supabase RPC to safely increment quantity
            const { error: rpcError } = await supabase.rpc('increment_product_quantity', {
                p_id: item.product_id,
                amount: item.quantity
            });

            if (rpcError) {
                console.error(`Failed to restore quantity for product ${item.product_id}:`, rpcError);
                return res.status(500).json({ error: "Failed to update product quantity. Order status not changed." });
            }
        }
    }

    const { error: cancelError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order_id);

    if (cancelError) {
      return res.status(500).json({ error: 'Failed to cancel the order after updating inventory.' });
    }

    return res.status(200).json({ message: 'Order successfully cancelled and inventory restored.' });
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