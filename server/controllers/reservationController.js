const db = require('../config/db');

// Create table reservation
async function createReservation(req, res) {
  try {
    const { customer_name, customer_phone, customer_email, reservation_date, reservation_time, guest_count, special_requests } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required' });
    }
    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!reservation_date) {
      return res.status(400).json({ success: false, error: 'Reservation date is required' });
    }
    if (!reservation_time) {
      return res.status(400).json({ success: false, error: 'Reservation time is required' });
    }

    const guests = parseInt(guest_count) || 2;
    if (guests < 1 || guests > 30) {
      return res.status(400).json({ success: false, error: 'Guest count must be between 1 and 30' });
    }

    if (db.isMySQLConnected()) {
      const [result] = await db.pool.execute(
        `INSERT INTO reservations 
         (customer_name, customer_phone, customer_email, reservation_date, reservation_time, guest_count, special_requests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [customer_name.trim(), customer_phone.trim(), customer_email || '', reservation_date, reservation_time, guests, special_requests || '']
      );

      return res.status(201).json({
        success: true,
        message: 'Table reservation request received! (Logged to MySQL backend - Demo confirmation)',
        reservationId: result.insertId,
        details: {
          customer_name,
          customer_phone,
          customer_email,
          reservation_date,
          reservation_time,
          guest_count: guests,
          status: 'Pending'
        }
      });
    }

    // Fallback store
    const store = db.getStore();
    const newId = (store.reservations || []).length > 0 ? Math.max(...store.reservations.map(r => r.id || 0)) + 1 : 1;

    const newReservation = {
      id: newId,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email || '',
      reservation_date,
      reservation_time,
      guest_count: guests,
      special_requests: special_requests || '',
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    store.reservations = store.reservations || [];
    store.reservations.unshift(newReservation);
    db.saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Table reservation request received! (Demo reservation recorded in local store)',
      reservationId: newId,
      details: newReservation
    });
  } catch (error) {
    console.error('Error in createReservation:', error);
    return res.status(500).json({ success: false, error: 'Failed to record reservation' });
  }
}

// Get all reservations (Admin)
async function getAllReservations(req, res) {
  try {
    if (db.isMySQLConnected()) {
      const [rows] = await db.pool.execute('SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC');
      return res.json({ success: true, count: rows.length, reservations: rows });
    }

    const store = db.getStore();
    return res.json({ success: true, count: (store.reservations || []).length, reservations: store.reservations || [] });
  } catch (error) {
    console.error('Error in getAllReservations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reservations' });
  }
}

// Update reservation status (Admin)
async function updateReservationStatus(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid reservation status' });
    }

    if (db.isMySQLConnected()) {
      await db.pool.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
      return res.json({ success: true, message: `Reservation status updated to ${status}` });
    }

    const store = db.getStore();
    const resv = (store.reservations || []).find(r => r.id === id);
    if (!resv) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    resv.status = status;
    db.saveStore(store);

    return res.json({ success: true, message: `Reservation status updated to ${status}` });
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    return res.status(500).json({ success: false, error: 'Failed to update reservation' });
  }
}

module.exports = {
  createReservation,
  getAllReservations,
  updateReservationStatus
};
