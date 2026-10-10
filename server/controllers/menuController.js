const db = require('../config/db');

// Get all categories
async function getCategories(req, res) {
  try {
    if (db.isMySQLConnected()) {
      const [rows] = await db.pool.execute('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
      return res.json({ success: true, categories: rows });
    }

    const store = db.getStore();
    return res.json({ success: true, categories: store.categories || [] });
  } catch (error) {
    console.error('Error in getCategories:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
  }
}

// Get menu items with search & category filters
async function getMenuItems(req, res) {
  try {
    const { category, search, veg, featured } = req.query;

    if (db.isMySQLConnected()) {
      let query = `
        SELECT m.*, c.name AS category_name, c.slug AS category_slug 
        FROM menu_items m
        JOIN categories c ON m.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (category && category !== 'all') {
        query += ' AND (c.slug = ? OR c.id = ?)';
        params.push(category, isNaN(category) ? -1 : parseInt(category));
      }

      if (search) {
        query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (veg !== undefined && veg !== '') {
        query += ' AND m.is_veg = ?';
        params.push(veg === 'true' || veg === '1' ? 1 : 0);
      }

      if (featured !== undefined && featured !== '') {
        query += ' AND m.is_featured = ?';
        params.push(featured === 'true' || featured === '1' ? 1 : 0);
      }

      query += ' ORDER BY m.category_id ASC, m.name ASC';

      const [items] = await db.pool.execute(query, params);
      return res.json({ success: true, count: items.length, items });
    }

    // Fallback in-memory/JSON store
    const store = db.getStore();
    let items = (store.items || []).map(item => {
      const cat = (store.categories || []).find(c => c.id === item.category_id);
      return {
        ...item,
        category_name: cat ? cat.name : (item.category_name || 'General'),
        category_slug: cat ? cat.slug : ''
      };
    });

    if (category && category !== 'all') {
      items = items.filter(i => i.category_slug === category || String(i.category_id) === String(category));
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }

    if (veg !== undefined && veg !== '') {
      const isVegBool = veg === 'true' || veg === '1' ? 1 : 0;
      items = items.filter(i => Number(i.is_veg) === isVegBool);
    }

    if (featured !== undefined && featured !== '') {
      const isFeatBool = featured === 'true' || featured === '1' ? 1 : 0;
      items = items.filter(i => Number(i.is_featured) === isFeatBool);
    }

    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve menu items' });
  }
}

// Get single menu item
async function getMenuItemById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid item ID' });
    }

    if (db.isMySQLConnected()) {
      const [rows] = await db.pool.execute(
        'SELECT m.*, c.name AS category_name FROM menu_items m JOIN categories c ON m.category_id = c.id WHERE m.id = ?',
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }
      return res.json({ success: true, item: rows[0] });
    }

    const store = db.getStore();
    const item = (store.items || []).find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    return res.json({ success: true, item });
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch item' });
  }
}

// Admin: Add new menu item
async function createMenuItem(req, res) {
  try {
    const { name, category_id, description, price, image_url, is_veg, is_spicy, is_featured, is_available } = req.body;

    if (!name || !category_id || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, category_id, and price are required' });
    }

    const parsedPrice = parseFloat(price);
    const parsedCatId = parseInt(category_id);
    const parsedVeg = is_veg ? 1 : 0;
    const parsedSpicy = is_spicy ? 1 : 0;
    const parsedFeatured = is_featured ? 1 : 0;
    const parsedAvailable = is_available !== undefined ? (is_available ? 1 : 0) : 1;
    const defaultImage = image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

    if (db.isMySQLConnected()) {
      const [result] = await db.pool.execute(
        `INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_spicy, is_featured, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [parsedCatId, name, description || '', parsedPrice, defaultImage, parsedVeg, parsedSpicy, parsedFeatured, parsedAvailable]
      );

      return res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        itemId: result.insertId
      });
    }

    // Fallback store
    const store = db.getStore();
    const newId = store.items.length > 0 ? Math.max(...store.items.map(i => i.id)) + 1 : 1;
    const cat = store.categories.find(c => c.id === parsedCatId);

    const newItem = {
      id: newId,
      category_id: parsedCatId,
      category_name: cat ? cat.name : 'General',
      name,
      description: description || '',
      price: parsedPrice,
      image_url: defaultImage,
      is_veg: parsedVeg,
      is_spicy: parsedSpicy,
      is_featured: parsedFeatured,
      is_available: parsedAvailable
    };

    store.items.push(newItem);
    db.saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    return res.status(500).json({ success: false, error: 'Failed to create menu item' });
  }
}

// Admin: Update menu item
async function updateMenuItem(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid item ID' });
    }

    const { name, category_id, description, price, image_url, is_veg, is_spicy, is_featured, is_available } = req.body;

    if (db.isMySQLConnected()) {
      await db.pool.execute(
        `UPDATE menu_items 
         SET category_id = COALESCE(?, category_id),
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             price = COALESCE(?, price),
             image_url = COALESCE(?, image_url),
             is_veg = COALESCE(?, is_veg),
             is_spicy = COALESCE(?, is_spicy),
             is_featured = COALESCE(?, is_featured),
             is_available = COALESCE(?, is_available)
         WHERE id = ?`,
        [
          category_id !== undefined ? parseInt(category_id) : null,
          name || null,
          description !== undefined ? description : null,
          price !== undefined ? parseFloat(price) : null,
          image_url || null,
          is_veg !== undefined ? (is_veg ? 1 : 0) : null,
          is_spicy !== undefined ? (is_spicy ? 1 : 0) : null,
          is_featured !== undefined ? (is_featured ? 1 : 0) : null,
          is_available !== undefined ? (is_available ? 1 : 0) : null,
          id
        ]
      );

      return res.json({ success: true, message: 'Menu item updated successfully' });
    }

    // Fallback store
    const store = db.getStore();
    const index = store.items.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const current = store.items[index];
    const updated = {
      ...current,
      name: name !== undefined ? name : current.name,
      category_id: category_id !== undefined ? parseInt(category_id) : current.category_id,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? parseFloat(price) : current.price,
      image_url: image_url !== undefined ? image_url : current.image_url,
      is_veg: is_veg !== undefined ? (is_veg ? 1 : 0) : current.is_veg,
      is_spicy: is_spicy !== undefined ? (is_spicy ? 1 : 0) : current.is_spicy,
      is_featured: is_featured !== undefined ? (is_featured ? 1 : 0) : current.is_featured,
      is_available: is_available !== undefined ? (is_available ? 1 : 0) : current.is_available
    };

    const cat = store.categories.find(c => c.id === updated.category_id);
    if (cat) updated.category_name = cat.name;

    store.items[index] = updated;
    db.saveStore(store);

    return res.json({ success: true, message: 'Menu item updated successfully', item: updated });
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    return res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
}

// Admin: Delete menu item
async function deleteMenuItem(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid item ID' });
    }

    if (db.isMySQLConnected()) {
      await db.pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Menu item deleted successfully' });
    }

    const store = db.getStore();
    store.items = (store.items || []).filter(i => i.id !== id);
    db.saveStore(store);

    return res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
}

module.exports = {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
