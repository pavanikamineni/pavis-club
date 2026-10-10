const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAdminAuth } = require('../middleware/auth');

// Public checkout submission
router.post('/', orderController.createOrder);

// Admin endpoints
router.get('/', requireAdminAuth, orderController.getAllOrders);
router.patch('/:id/status', requireAdminAuth, orderController.updateOrderStatus);

module.exports = router;
