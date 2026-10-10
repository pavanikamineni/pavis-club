const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { requireAdminAuth } = require('../middleware/auth');

// Public endpoints
router.get('/categories', menuController.getCategories);
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Protected administrative endpoints
router.post('/', requireAdminAuth, menuController.createMenuItem);
router.put('/:id', requireAdminAuth, menuController.updateMenuItem);
router.delete('/:id', requireAdminAuth, menuController.deleteMenuItem);

module.exports = router;
