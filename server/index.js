const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Database & Server Status API
app.get('/api/status', (req, res) => {
  res.json({
    name: "Pavi's Club API Server",
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    database: db.getStatus(),
    restaurant: {
      phone: process.env.RESTAURANT_PHONE || '+91 98765 43210',
      whatsapp: process.env.RESTAURANT_WHATSAPP || '919876543210',
      email: process.env.RESTAURANT_EMAIL || 'hello@pavisclub.com',
      address: process.env.RESTAURANT_ADDRESS || '124 Royal Avenue, Jubilee Hills, Hyderabad',
      hours: process.env.RESTAURANT_HOURS || 'Mon - Sun: 11:30 AM - 11:30 PM'
    }
  });
});

// Admin Route Direct Serving
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Fallback for HTML routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`👑 PAVI'S CLUB - RESTAURANT WEB APPLICATION`);
  console.log(`======================================================`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🍽️  Customer Website: http://localhost:${PORT}/index.html`);
  console.log(`📋 Food Menu:        http://localhost:${PORT}/menu.html`);
  console.log(`🥂 Reservations:     http://localhost:${PORT}/reservation.html`);
  console.log(`✨ About Us:         http://localhost:${PORT}/about.html`);
  console.log(`📞 Contact:          http://localhost:${PORT}/contact.html`);
  console.log(`🔐 Admin Dashboard:  http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
