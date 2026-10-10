/* ========================================================
   PAVI'S CLUB - ADMIN DASHBOARD CONTROLLER
   ======================================================== */

let adminToken = localStorage.getItem('pavis_admin_token') || null;
let currentEditingItemId = null;
let cachedCategories = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initTabs();
  initDishModal();
});

// Admin Authentication State
function initAdminAuth() {
  const loginSection = document.getElementById('adminLoginSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  if (adminToken) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashSection) dashSection.style.display = 'block';
    loadAdminDashboard();
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashSection) dashSection.style.display = 'none';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value;
      const errorEl = document.getElementById('loginErrorMsg');

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
          adminToken = data.token;
          localStorage.setItem('pavis_admin_token', adminToken);
          if (loginSection) loginSection.style.display = 'none';
          if (dashSection) dashSection.style.display = 'block';
          showToast('Welcome back, Head Manager! 👑', 'success');
          loadAdminDashboard();
        } else {
          if (errorEl) {
            errorEl.textContent = data.error || 'Authentication failed';
            errorEl.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        if (errorEl) {
          errorEl.textContent = 'Server connection error';
          errorEl.style.display = 'block';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      adminToken = null;
      localStorage.removeItem('pavis_admin_token');
      if (loginSection) loginSection.style.display = 'flex';
      if (dashSection) dashSection.style.display = 'none';
      showToast('Logged out of Admin Concierge', 'info');
    });
  }
}

// Admin Tab navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      // Refresh data on tab click
      if (tabId === 'tabOrders') loadOrders();
      if (tabId === 'tabReservations') loadReservations();
      if (tabId === 'tabMenu') loadMenuItems();
      if (tabId === 'tabMessages') loadMessages();
    });
  });
}

// Master Dashboard Loader
async function loadAdminDashboard() {
  await fetchCategories();
  loadStats();
  loadMenuItems();
  loadOrders();
  loadReservations();
  loadMessages();
}

// Fetch categories for dish dropdown
async function fetchCategories() {
  try {
    const res = await fetch('/api/menu/categories');
    const data = await res.json();
    if (data.success) {
      cachedCategories = data.categories;
      const select = document.getElementById('dishCategorySelect');
      if (select) {
        select.innerHTML = cachedCategories.map(c => `
          <option value="${c.id}">${c.name}</option>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// Load KPIs & Database Status
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      const s = data.stats;
      document.getElementById('statTotalRevenue').textContent = `₹${parseFloat(s.totalRevenue).toFixed(2)}`;
      document.getElementById('statTotalOrders').textContent = s.totalOrders;
      document.getElementById('statPendingOrders').textContent = s.pendingOrders;
      document.getElementById('statTotalDishes').textContent = s.totalMenuItems;
      document.getElementById('statReservations').textContent = s.totalReservations;

      // Database status pill
      const dbStatusEl = document.getElementById('adminDbStatusPill');
      if (dbStatusEl && data.database) {
        if (data.database.connected) {
          dbStatusEl.className = 'db-status-pill';
          dbStatusEl.innerHTML = `🟢 Database: ${data.database.type} (${data.database.database})`;
        } else {
          dbStatusEl.className = 'db-status-pill warning';
          dbStatusEl.innerHTML = `🟡 Local Fallback Store Active`;
        }
      }
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Load Menu Items Table
async function loadMenuItems() {
  const tbody = document.getElementById('adminMenuTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Loading dishes... 🍲</td></tr>`;

  try {
    const res = await fetch('/api/menu');
    const data = await res.json();

    if (data.success && data.items.length > 0) {
      tbody.innerHTML = data.items.map(item => `
        <tr>
          <td>
            <div class="dish-cell-wrap">
              <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}" class="admin-dish-thumb" alt="${item.name}">
              <div>
                <strong style="color:var(--text-cream-bright); display:block;">${item.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-cream-dim);">${item.category_name}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-tag ${Number(item.is_veg) === 1 ? 'badge-veg' : 'badge-nonveg'}">
              ${Number(item.is_veg) === 1 ? 'Veg' : 'Non-Veg'}
            </span>
          </td>
          <td>
            <strong style="color:var(--gold-primary);">₹${parseFloat(item.price).toFixed(2)}</strong>
          </td>
          <td>
            <label style="cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem;">
              <input type="checkbox" ${Number(item.is_available) === 1 ? 'checked' : ''} onchange="toggleItemAvailability(${item.id}, this.checked)">
              <span style="font-size:0.8rem; color:${Number(item.is_available) === 1 ? '#2ecc71' : '#e74c3c'};">
                ${Number(item.is_available) === 1 ? 'Available' : 'Sold Out'}
              </span>
            </label>
          </td>
          <td>
            ${Number(item.is_featured) === 1 ? '<span style="color:var(--gold-light);">★ Featured</span>' : '<span style="color:var(--text-cream-dim);">Standard</span>'}
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-action-icon" title="Edit Dish" onclick='openEditDishModal(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                ✏️
              </button>
              <button class="btn-action-icon delete" title="Delete Dish" onclick="deleteDish(${item.id}, '${item.name.replace(/'/g, "\\'")}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No menu items found.</td></tr>`;
    }
  } catch (err) {
    console.error('Error fetching menu items:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#e74c3c;">Failed to load dishes.</td></tr>`;
  }
}

// Toggle Item Availability
async function toggleItemAvailability(id, isAvailable) {
  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_available: isAvailable ? 1 : 0 })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Dish marked as ${isAvailable ? 'Available' : 'Sold Out'}`, 'success');
    }
  } catch (err) {
    console.error('Error updating availability:', err);
    showToast('Failed to update availability', 'error');
  }
}

// Delete Dish
async function deleteDish(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;

  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Deleted "${name}"`, 'info');
      loadMenuItems();
      loadStats();
    } else {
      showToast(data.error || 'Failed to delete dish', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Server error while deleting', 'error');
  }
}

// Dish Modal (Add / Edit)
function initDishModal() {
  const form = document.getElementById('dishForm');
  const addBtn = document.getElementById('openAddDishBtn');
  const modal = document.getElementById('dishModal');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      currentEditingItemId = null;
      if (form) form.reset();
      document.getElementById('dishModalTitle').textContent = 'Add New Culinary Dish';
      if (modal) modal.classList.add('open');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: form.name.value.trim(),
        category_id: form.category_id.value,
        price: parseFloat(form.price.value),
        description: form.description.value.trim(),
        image_url: form.image_url.value.trim(),
        is_veg: form.is_veg.checked ? 1 : 0,
        is_spicy: form.is_spicy.checked ? 1 : 0,
        is_featured: form.is_featured.checked ? 1 : 0,
        is_available: form.is_available.checked ? 1 : 0
      };

      const isEdit = currentEditingItemId !== null;
      const url = isEdit ? `/api/menu/${currentEditingItemId}` : '/api/menu';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          showToast(isEdit ? 'Dish updated successfully!' : 'Dish created successfully!', 'success');
          if (modal) modal.classList.remove('open');
          loadMenuItems();
          loadStats();
        } else {
          showToast(data.error || 'Failed to save dish', 'error');
        }
      } catch (err) {
        console.error('Dish form error:', err);
        showToast('Connection error', 'error');
      }
    });
  }
}

function openEditDishModal(dish) {
  currentEditingItemId = dish.id;
  const form = document.getElementById('dishForm');
  const modal = document.getElementById('dishModal');
  if (!form || !modal) return;

  document.getElementById('dishModalTitle').textContent = 'Edit Dish Details';
  form.name.value = dish.name;
  form.category_id.value = dish.category_id;
  form.price.value = dish.price;
  form.description.value = dish.description || '';
  form.image_url.value = dish.image_url || '';
  form.is_veg.checked = Number(dish.is_veg) === 1;
  form.is_spicy.checked = Number(dish.is_spicy) === 1;
  form.is_featured.checked = Number(dish.is_featured) === 1;
  form.is_available.checked = Number(dish.is_available) === 1;

  modal.classList.add('open');
}

// Load Orders
async function loadOrders() {
  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">Loading orders... 📦</td></tr>`;

  try {
    const res = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.orders.length > 0) {
      tbody.innerHTML = data.orders.map(o => {
        const itemsSummary = (o.items || []).map(i => `${i.item_name} ×${i.quantity}`).join(', ') || 'N/A';
        const dateStr = new Date(o.created_at).toLocaleDateString() + ' ' + new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
          <tr>
            <td>
              <strong style="color:var(--gold-primary); font-family:var(--font-brand);">${o.order_number}</strong>
              <div style="font-size:0.75rem; color:var(--text-cream-dim);">${dateStr}</div>
            </td>
            <td>
              <strong style="color:var(--text-cream-bright);">${o.customer_name}</strong>
              <div style="font-size:0.78rem; color:var(--text-cream-dim);">${o.customer_phone}</div>
            </td>
            <td style="max-width:240px; font-size:0.82rem;">
              <div style="color:var(--text-cream-bright); margin-bottom:0.2rem;">${itemsSummary}</div>
              <div style="color:var(--text-cream-dim); font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.delivery_address}">
                📍 ${o.delivery_address}
              </div>
            </td>
            <td>
              <strong style="color:var(--gold-light);">₹${parseFloat(o.total_amount).toFixed(2)}</strong>
              <div style="font-size:0.75rem; color:var(--text-cream-dim);">${o.payment_method}</div>
            </td>
            <td>
              <select class="form-control" style="padding:0.4rem 0.6rem; font-size:0.82rem; width:auto;" onchange="updateOrderStatus(${o.id}, this.value)">
                <option value="Pending" ${o.order_status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Confirmed" ${o.order_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="Preparing" ${o.order_status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                <option value="Out for Delivery" ${o.order_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="Delivered" ${o.order_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${o.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No orders yet. Place a test order from the website!</td></tr>`;
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#e74c3c;">Failed to load orders.</td></tr>`;
  }
}

// Update Order Status
async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order status updated to "${status}"`, 'success');
      loadStats();
    }
  } catch (err) {
    console.error('Error updating order:', err);
    showToast('Failed to update status', 'error');
  }
}

// Load Reservations
async function loadReservations() {
  const tbody = document.getElementById('adminResvTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Loading reservations... 🍷</td></tr>`;

  try {
    const res = await fetch('/api/reservations', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.reservations.length > 0) {
      tbody.innerHTML = data.reservations.map(r => `
        <tr>
          <td>
            <strong style="color:var(--text-cream-bright);">${r.customer_name}</strong>
            <div style="font-size:0.78rem; color:var(--text-cream-dim);">${r.customer_phone}</div>
          </td>
          <td>
            <strong>${r.reservation_date}</strong>
            <div style="font-size:0.8rem; color:var(--gold-primary);">${r.reservation_time}</div>
          </td>
          <td>
            <span style="font-weight:700; color:var(--gold-light);">${r.guest_count} Guests</span>
          </td>
          <td style="max-width:200px; font-size:0.82rem; color:var(--text-cream-muted);">
            ${r.special_requests || 'Standard Seating'}
          </td>
          <td>
            <span class="status-pill status-${(r.status || 'pending').toLowerCase()}">
              ${r.status || 'Pending'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-primary btn-sm" style="padding:0.3rem 0.75rem; font-size:0.78rem;" onclick="updateResvStatus(${r.id}, 'Confirmed')">
                Confirm
              </button>
              <button class="btn btn-outline btn-sm" style="padding:0.3rem 0.75rem; font-size:0.78rem; color:#e74c3c; border-color:#e74c3c;" onclick="updateResvStatus(${r.id}, 'Cancelled')">
                Cancel
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No reservation requests yet.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading reservations:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#e74c3c;">Failed to load reservations.</td></tr>`;
  }
}

// Update Reservation Status
async function updateResvStatus(id, status) {
  try {
    const res = await fetch(`/api/reservations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Reservation marked as ${status}`, 'success');
      loadReservations();
      loadStats();
    }
  } catch (err) {
    console.error('Error updating reservation:', err);
    showToast('Failed to update reservation', 'error');
  }
}

// Load Contact Messages
async function loadMessages() {
  const container = document.getElementById('adminMessagesList');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:2rem;">Loading messages... ✉️</div>`;

  try {
    const res = await fetch('/api/contact', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.messages.length > 0) {
      container.innerHTML = data.messages.map(m => `
        <div style="background:#171512; border:1px solid ${m.is_read ? 'var(--border-subtle)' : 'var(--gold-border)'}; border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
            <div>
              <strong style="color:var(--text-cream-bright); font-size:1rem;">${m.name}</strong>
              <div style="font-size:0.8rem; color:var(--text-cream-dim);">${m.email} ${m.phone ? '• ' + m.phone : ''}</div>
            </div>
            <div>
              ${!m.is_read ? `
                <button class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="markMessageRead(${m.id})">
                  Mark as Read
                </button>
              ` : '<span style="font-size:0.75rem; color:var(--text-cream-dim);">✓ Read</span>'}
            </div>
          </div>
          <div style="color:var(--gold-light); font-weight:600; font-size:0.9rem; margin-bottom:0.35rem;">
            ${m.subject || 'General Inquiry'}
          </div>
          <p style="color:var(--text-cream-muted); font-size:0.88rem; line-height:1.5;">
            ${m.message}
          </p>
          <div style="font-size:0.72rem; color:var(--text-cream-dim); margin-top:0.5rem;">
            Received: ${new Date(m.created_at).toLocaleString()}
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-cream-dim);">No customer inquiries yet.</div>`;
    }
  } catch (err) {
    console.error('Error loading messages:', err);
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:#e74c3c;">Failed to load messages.</div>`;
  }
}

// Mark Message as Read
async function markMessageRead(id) {
  try {
    const res = await fetch(`/api/contact/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Marked as read', 'info');
      loadMessages();
      loadStats();
    }
  } catch (err) {
    console.error('Error marking message read:', err);
  }
}
