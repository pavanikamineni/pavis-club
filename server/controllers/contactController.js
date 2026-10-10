const db = require('../config/db');

// Submit contact inquiry
async function createContactMessage(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const sub = subject && subject.trim() ? subject.trim() : 'General Inquiry';

    if (db.isMySQLConnected()) {
      await db.pool.execute(
        `INSERT INTO contact_messages (name, email, phone, subject, message, is_read)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [name.trim(), email.trim(), phone ? phone.trim() : '', sub, message.trim()]
      );

      return res.status(201).json({
        success: true,
        message: 'Your message has been sent to Pavi\'s Club concierge! (Logged to MySQL backend)'
      });
    }

    // Fallback store
    const store = db.getStore();
    const newId = (store.messages || []).length > 0 ? Math.max(...store.messages.map(m => m.id || 0)) + 1 : 1;

    const newMessage = {
      id: newId,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: sub,
      message: message.trim(),
      is_read: 0,
      created_at: new Date().toISOString()
    };

    store.messages = store.messages || [];
    store.messages.unshift(newMessage);
    db.saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Your message has been received! (Recorded in fallback local store)'
    });
  } catch (error) {
    console.error('Error in createContactMessage:', error);
    return res.status(500).json({ success: false, error: 'Failed to record contact message' });
  }
}

// Get all contact messages (Admin)
async function getAllMessages(req, res) {
  try {
    if (db.isMySQLConnected()) {
      const [rows] = await db.pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
      return res.json({ success: true, count: rows.length, messages: rows });
    }

    const store = db.getStore();
    return res.json({ success: true, count: (store.messages || []).length, messages: store.messages || [] });
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch contact messages' });
  }
}

// Mark message as read
async function markMessageRead(req, res) {
  try {
    const id = parseInt(req.params.id);

    if (db.isMySQLConnected()) {
      await db.pool.execute('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Message marked as read' });
    }

    const store = db.getStore();
    const msg = (store.messages || []).find(m => m.id === id);
    if (msg) msg.is_read = 1;
    db.saveStore(store);

    return res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error in markMessageRead:', error);
    return res.status(500).json({ success: false, error: 'Failed to update message' });
  }
}

module.exports = {
  createContactMessage,
  getAllMessages,
  markMessageRead
};
