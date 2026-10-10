const db = require('../config/db');
require('dotenv').config();

// Admin Login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUser && password === validPass) {
      const token = Buffer.from(`${validUser}:${validPass}`).toString('base64');
      return res.json({
        success: true,
        message: 'Admin authentication successful',
        token,
        admin: {
          username: validUser,
          role: 'Head Manager'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid username or password. (Demo defaults: admin / admin123)'
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
}

// Get Dashboard Statistics
async function getStats(req, res) {
  try {
    const dbStatus = db.getStatus();

    if (db.isMySQLConnected()) {
      const [[orderStats]] = await db.pool.execute(
        `SELECT COUNT(*) AS total_orders, 
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders
         FROM orders`
      );

      const [[menuStats]] = await db.pool.execute('SELECT COUNT(*) AS total_items FROM menu_items');
      const [[resvStats]] = await db.pool.execute('SELECT COUNT(*) AS total_reservations FROM reservations');
      const [[msgStats]] = await db.pool.execute('SELECT COUNT(*) AS unread_messages FROM contact_messages WHERE is_read = 0');

      return res.json({
        success: true,
        stats: {
          totalOrders: Number(orderStats.total_orders || 0),
          totalRevenue: Number(orderStats.total_revenue || 0),
          pendingOrders: Number(orderStats.pending_orders || 0),
          totalMenuItems: Number(menuStats.total_items || 0),
          totalReservations: Number(resvStats.total_reservations || 0),
          unreadMessages: Number(msgStats.unread_messages || 0)
        },
        database: dbStatus
      });
    }

    // Fallback store
    const store = db.getStore();
    const totalOrders = (store.orders || []).length;
    const totalRevenue = (store.orders || []).reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
    const pendingOrders = (store.orders || []).filter(o => o.order_status === 'Pending').length;
    const totalMenuItems = (store.items || []).length;
    const totalReservations = (store.reservations || []).length;
    const unreadMessages = (store.messages || []).filter(m => !m.is_read).length;

    return res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        totalMenuItems,
        totalReservations,
        unreadMessages
      },
      database: dbStatus
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve admin stats' });
  }
}

module.exports = {
  login,
  getStats
};
