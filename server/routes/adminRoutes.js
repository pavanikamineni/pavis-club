const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/auth');

router.post('/login', adminController.login);
router.get('/stats', requireAdminAuth, adminController.getStats);

module.exports = router;
