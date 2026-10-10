const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { requireAdminAuth } = require('../middleware/auth');

// Public table booking submission
router.post('/', reservationController.createReservation);

// Admin endpoints
router.get('/', requireAdminAuth, reservationController.getAllReservations);
router.patch('/:id/status', requireAdminAuth, reservationController.updateReservationStatus);

module.exports = router;
