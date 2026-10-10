/* ========================================================
   PAVI'S CLUB - GLOBAL SCRIPTS & INTERACTION
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNav();
  initModals();
  loadFeaturedDishes();
  initHomeReservationForm();
});

// Sticky Navbar Background on Scroll
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Mobile Navigation
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const menu = document.getElementById('mobileNavMenu');
  const closeBtn = document.getElementById('mobileNavClose');

  if (!toggleBtn || !menu) return;

  const toggle = (open) => {
    if (open) {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  toggleBtn.addEventListener('click', () => toggle(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });
}

// Global Modals Closer
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }
  });
}

// Load Featured Dishes on Home Page
async function loadFeaturedDishes() {
  const container = document.getElementById('featuredDishesGrid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--gold-light);">
      Loading Chef's Signature Curations... 🍳
    </div>
  `;

  try {
    const res = await fetch('/api/menu?featured=1');
    const data = await res.json();

    if (data.success && data.items.length > 0) {
      container.innerHTML = data.items.slice(0, 6).map(dish => renderDishCard(dish)).join('');
    } else {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-cream-dim);">
          No featured dishes currently available.
        </div>
      `;
    }
  } catch (err) {
    console.error('Error fetching featured items:', err);
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#e74c3c;">
        Unable to load featured dishes. Please verify server connection.
      </div>
    `;
  }
}

// Render Single Dish Card Component
function renderDishCard(dish) {
  const isVeg = Number(dish.is_veg) === 1;
  const isSpicy = Number(dish.is_spicy) === 1;
  const isFeatured = Number(dish.is_featured) === 1;
  const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return `
    <div class="dish-card" data-id="${dish.id}" data-category="${dish.category_slug || ''}">
      <div class="dish-image-wrap">
        <img src="${dish.image_url || defaultImg}" alt="${dish.name}" class="dish-image" loading="lazy" onerror="this.src='${defaultImg}'">
        <div class="dish-tag-list">
          <span class="badge-tag ${isVeg ? 'badge-veg' : 'badge-nonveg'}">
            ${isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
          </span>
          ${isFeatured ? '<span class="badge-tag badge-featured">★ Signature</span>' : ''}
          ${isSpicy ? '<span class="badge-tag badge-spicy">🌶️ Spicy</span>' : ''}
        </div>
      </div>
      <div class="dish-content">
        <span class="dish-category-label">${dish.category_name || 'Chef Specialty'}</span>
        <h4 class="dish-title">${dish.name}</h4>
        <p class="dish-description">${dish.description || 'Authentic artisan recipe prepared with hand-selected ingredients.'}</p>
        <div class="dish-footer">
          <div class="dish-price-wrap">
            <span class="dish-price">₹${parseFloat(dish.price).toFixed(2)}</span>
            <span class="dish-demo-note">Demo Price</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick='window.cart.addItem(${JSON.stringify(dish).replace(/'/g, "&#39;")})'>
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// Quick Reservation Form Handler on Home or Callout
function initHomeReservationForm() {
  const form = document.getElementById('homeReservationForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Securing Table... ⏳';
    submitBtn.disabled = true;

    const payload = {
      customer_name: form.customer_name.value.trim(),
      customer_phone: form.customer_phone.value.trim(),
      customer_email: form.customer_email ? form.customer_email.value.trim() : '',
      reservation_date: form.reservation_date.value,
      reservation_time: form.reservation_time.value,
      guest_count: form.guest_count.value,
      special_requests: form.special_requests ? form.special_requests.value.trim() : ''
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast('Table reserved successfully! Confirmation sent. 🎉', 'success');
        form.reset();
        
        // Show confirmation popup if available
        const modal = document.getElementById('resvSuccessModal');
        if (modal) {
          const body = document.getElementById('resvSuccessBody');
          if (body) {
            body.innerHTML = `
              <div style="text-align:center;">
                <div style="font-size:3rem; margin-bottom:1rem;">🥂</div>
                <h3 style="color:var(--gold-light); font-size:1.7rem; margin-bottom:0.5rem;">Reservation Confirmed!</h3>
                <p style="color:var(--text-cream-dim); margin-bottom:1.5rem;">We look forward to hosting you at Pavi's Club.</p>
                <div style="background:var(--bg-secondary); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--gold-border); text-align:left; font-size:0.9rem; margin-bottom:1.5rem;">
                  <div><strong>Guest:</strong> ${payload.customer_name} (${payload.guest_count} Guests)</div>
                  <div><strong>Date & Time:</strong> ${payload.reservation_date} at ${payload.reservation_time}</div>
                  <div><strong>Contact:</strong> ${payload.customer_phone}</div>
                </div>
                <div style="background:rgba(212, 175, 55, 0.08); padding:0.75rem; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--gold-light); margin-bottom:1.5rem;">
                  ℹ️ <strong>Demo Notice:</strong> Request recorded on the backend. Our maître d' will confirm your table upon arrival.
                </div>
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('resvSuccessModal').classList.remove('open')">
                  Great, Thank You
                </button>
              </div>
            `;
          }
          modal.classList.add('open');
        }
      } else {
        showToast(data.error || 'Failed to complete reservation', 'error');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      showToast('Could not submit reservation. Check connection.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}
