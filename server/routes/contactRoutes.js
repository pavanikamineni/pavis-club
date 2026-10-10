const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { requireAdminAuth } = require('../middleware/auth');

// Public contact submission
router.post('/', contactController.createContactMessage);

// Admin endpoints
router.get('/', requireAdminAuth, contactController.getAllMessages);
router.patch('/:id/read', requireAdminAuth, contactController.markMessageRead);

module.exports = router;
