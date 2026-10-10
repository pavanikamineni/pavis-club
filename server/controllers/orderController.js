const db = require('../config/db');

// Create a new order
async function createOrder(req, res) {
  try {
    const { customer_name, customer_phone, delivery_address, order_notes, payment_method, items } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }
    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, error: 'Customer phone number is required' });
    }
    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart must contain at least one item' });
    }

    // Calculate totals
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 1;
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;
      return {
        menu_item_id: item.id || null,
        item_name: item.name || 'Unnamed Dish',
        item_price: price,
        quantity: qty,
        subtotal: itemSubtotal
      };
    });

    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const delivery_fee = subtotal >= 500 ? 0.00 : 40.00; // Free delivery over ₹500
    const total_amount = Math.round((subtotal + tax + delivery_fee) * 100) / 100;

    const orderNumber = `PAVI-${Math.floor(100000 + Math.random() * 900000)}`;
    const pMethod = payment_method || 'Cash on Delivery';

    if (db.isMySQLConnected()) {
      const connection = await db.pool.getConnection();
      try {
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
          `INSERT INTO orders 
           (order_number, customer_name, customer_phone, delivery_address, order_notes, payment_method, payment_status, subtotal, tax, delivery_fee, total_amount, order_status)
           VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, 'Pending')`,
          [orderNumber, customer_name.trim(), customer_phone.trim(), delivery_address.trim(), order_notes || '', pMethod, subtotal, tax, delivery_fee, total_amount]
        );

        const orderId = orderResult.insertId;

        for (const it of sanitizedItems) {
          await connection.execute(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, it.menu_item_id, it.item_name, it.item_price, it.quantity, it.subtotal]
          );
        }

        await connection.commit();

        return res.status(201).json({
          success: true,
          message: 'Order created successfully! (Demo submission logged to MySQL backend)',
          order: {
            id: orderId,
            order_number: orderNumber,
            customer_name,
            customer_phone,
            delivery_address,
            subtotal,
            tax,
            delivery_fee,
            total_amount,
            order_status: 'Pending',
            payment_method: pMethod,
            items: sanitizedItems,
            created_at: new Date().toISOString()
          }
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback store
    const store = db.getStore();
    const newId = (store.orders || []).length > 0 ? Math.max(...store.orders.map(o => o.id || 0)) + 1 : 1;

    const newOrder = {
      id: newId,
      order_number: orderNumber,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      delivery_address: delivery_address.trim(),
      order_notes: order_notes || '',
      payment_method: pMethod,
      payment_status: 'Pending',
      subtotal,
      tax,
      delivery_fee,
      total_amount,
      order_status: 'Pending',
      items: sanitizedItems,
      created_at: new Date().toISOString()
    };

    store.orders = store.orders || [];
    store.orders.unshift(newOrder);
    db.saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully! (Demo order logged to local store backend)',
      order: newOrder
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return res.status(500).json({ success: false, error: 'Failed to process order' });
  }
}

// Get all orders (Admin)
async function getAllOrders(req, res) {
  try {
    if (db.isMySQLConnected()) {
      const [orders] = await db.pool.execute('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
      
      // Get items for each order
      for (let order of orders) {
        const [items] = await db.pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        order.items = items;
      }

      return res.json({ success: true, count: orders.length, orders });
    }

    const store = db.getStore();
    return res.json({ success: true, count: (store.orders || []).length, orders: store.orders || [] });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve orders' });
  }
}

// Update order status (Admin)
async function updateOrderStatus(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    if (db.isMySQLConnected()) {
      await db.pool.execute('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
      return res.json({ success: true, message: `Order status updated to ${status}` });
    }

    const store = db.getStore();
    const order = (store.orders || []).find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    order.order_status = status;
    db.saveStore(store);

    return res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};
