/* ========================================================
   PAVI'S CLUB - CART & CHECKOUT MANAGEMENT SYSTEM
   ======================================================== */

class CartManager {
  constructor() {
    this.storageKey = 'pavis_club_cart';
    this.items = this.loadCart();
    this.whatsappNumber = '919876543210';
    this.initElements();
    this.bindEvents();
    this.updateUI();
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
    this.updateUI();
  }

  initElements() {
    this.cartDrawer = document.getElementById('cartDrawer');
    this.cartOverlay = document.getElementById('cartOverlay');
    this.cartItemsList = document.getElementById('cartItemsList');
    this.cartBadge = document.getElementById('cartCountBadge');
    this.cartSubtotalEl = document.getElementById('cartSubtotal');
    this.cartTaxEl = document.getElementById('cartTax');
    this.cartDeliveryEl = document.getElementById('cartDelivery');
    this.cartTotalEl = document.getElementById('cartTotal');
    this.whatsappBtn = document.getElementById('cartWhatsAppBtn');
    this.checkoutBtn = document.getElementById('cartCheckoutBtn');
    this.checkoutModal = document.getElementById('checkoutModal');
    this.orderSuccessModal = document.getElementById('orderSuccessModal');
  }

  bindEvents() {
    // Open cart buttons
    document.querySelectorAll('.cart-open-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    // Close cart button
    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCart());
    }

    if (this.cartOverlay) {
      this.cartOverlay.addEventListener('click', () => this.closeCart());
    }

    // Checkout button
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          showToast('Your cart is empty. Please add delicious dishes first!', 'info');
          return;
        }
        this.closeCart();
        this.openCheckoutModal();
      });
    }

    // WhatsApp Order button
    if (this.whatsappBtn) {
      this.whatsappBtn.addEventListener('click', () => {
        this.orderViaWhatsApp();
      });
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }
  }

  addItem(dish) {
    const existing = this.items.find(i => Number(i.id) === Number(dish.id));
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        price: parseFloat(dish.price),
        image_url: dish.image_url,
        is_veg: dish.is_veg,
        quantity: 1
      });
    }
    this.saveCart();
    showToast(`Added "${dish.name}" to cart! 🍽️`, 'success');
  }

  updateQuantity(id, delta) {
    const item = this.items.find(i => Number(i.id) === Number(id));
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.items = this.items.filter(i => Number(i.id) !== Number(id));
      showToast(`Removed "${item.name}" from cart`, 'info');
    }
    this.saveCart();
  }

  removeItem(id) {
    const item = this.items.find(i => Number(i.id) === Number(id));
    if (item) {
      this.items = this.items.filter(i => Number(i.id) !== Number(id));
      this.saveCart();
      showToast(`Removed "${item.name}" from cart`, 'info');
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getCalculations() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const delivery = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
    const total = Math.round((subtotal + tax + delivery) * 100) / 100;
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, delivery, total, totalItems };
  }

  updateUI() {
    const { subtotal, tax, delivery, total, totalItems } = this.getCalculations();

    // Update Badges
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    if (!this.cartItemsList) return;

    // Render Drawer Content
    if (this.items.length === 0) {
      this.cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🍽️</div>
          <h4 class="cart-empty-title">Your Cart is Empty</h4>
          <p class="cart-empty-desc">Discover our chef's signature preparations and add your favorite dishes.</p>
          <a href="menu.html" class="btn btn-primary btn-sm">Explore Menu</a>
        </div>
      `;
      if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = '₹0';
      if (this.cartTaxEl) this.cartTaxEl.textContent = '₹0';
      if (this.cartDeliveryEl) this.cartDeliveryEl.textContent = '₹0';
      if (this.cartTotalEl) this.cartTotalEl.textContent = '₹0';
      return;
    }

    this.cartItemsList.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h5 class="cart-item-name">${item.name}</h5>
          <div class="cart-item-price">₹${item.price} each</div>
          <div style="font-size:0.75rem; color:var(--text-cream-dim); margin-top:2px;">
            Total: ₹${item.price * item.quantity}
          </div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn" onclick="window.cart.updateQuantity(${item.id}, -1)">−</button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="window.cart.updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="cart-item-remove" title="Remove Item" onclick="window.cart.removeItem(${item.id})">✕</button>
      </div>
    `).join('');

    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (this.cartTaxEl) this.cartTaxEl.textContent = `₹${tax.toFixed(2)}`;
    if (this.cartDeliveryEl) this.cartDeliveryEl.textContent = delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`;
    if (this.cartTotalEl) this.cartTotalEl.textContent = `₹${total.toFixed(2)}`;
  }

  openCart() {
    if (this.cartDrawer) this.cartDrawer.classList.add('open');
    if (this.cartOverlay) this.cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    if (this.cartDrawer) this.cartDrawer.classList.remove('open');
    if (this.cartOverlay) this.cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    const { subtotal, tax, delivery, total } = this.getCalculations();

    // Fill in summary
    const summaryEl = document.getElementById('checkoutSummaryBox');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="background:var(--bg-secondary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:1.25rem;">
          <div style="font-size:0.85rem; color:var(--gold-light); font-weight:600; margin-bottom:0.5rem;">ORDER SUMMARY (${this.items.length} items)</div>
          ${this.items.map(i => `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
              <span>${i.name} × ${i.quantity}</span>
              <span>₹${i.price * i.quantity}</span>
            </div>
          `).join('')}
          <div style="border-top:1px dashed var(--gold-border); margin-top:0.5rem; padding-top:0.5rem; display:flex; justify-content:space-between; font-weight:700; color:var(--gold-light);">
            <span>Payable Amount:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>
      `;
    }

    modal.classList.add('open');
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('open');
  }

  async handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Processing Order... ⏳';
    submitBtn.disabled = true;

    const customer_name = form.customer_name.value.trim();
    const customer_phone = form.customer_phone.value.trim();
    const delivery_address = form.delivery_address.value.trim();
    const order_notes = form.order_notes ? form.order_notes.value.trim() : '';
    const paymentMethodEl = form.querySelector('input[name="payment_method"]:checked');
    const payment_method = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery';

    if (!customer_name || !customer_phone || !delivery_address) {
      showToast('Please fill all required delivery details', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name,
          customer_phone,
          delivery_address,
          order_notes,
          payment_method,
          items: this.items
        })
      });

      const data = await response.json();

      if (data.success) {
        this.closeCheckoutModal();
        this.showOrderConfirmation(data.order);
        this.clearCart();
        form.reset();
      } else {
        showToast(data.error || 'Failed to place order', 'error');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      showToast('Connection error. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  showOrderConfirmation(order) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    const body = document.getElementById('orderSuccessBody');
    if (body) {
      body.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:3.5rem; margin-bottom:1rem;">🎉</div>
          <h3 style="font-size:1.8rem; color:var(--gold-light); margin-bottom:0.5rem;">Order Placed Successfully!</h3>
          <p style="color:var(--text-cream-dim); margin-bottom:1.5rem; font-size:0.9rem;">
            Order ID: <strong style="color:var(--gold-primary);">${order.order_number}</strong>
          </p>

          <div style="background:var(--bg-secondary); border:1px solid var(--gold-border); border-radius:var(--radius-md); padding:1.25rem; text-align:left; margin-bottom:1.5rem; font-size:0.9rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span style="color:var(--text-cream-dim);">Customer:</span>
              <strong style="color:var(--text-cream-bright);">${order.customer_name}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span style="color:var(--text-cream-dim);">Contact:</span>
              <span>${order.customer_phone}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span style="color:var(--text-cream-dim);">Payment Mode:</span>
              <span>${order.payment_method}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span style="color:var(--text-cream-dim);">Total Amount:</span>
              <strong style="color:var(--gold-primary);">₹${parseFloat(order.total_amount).toFixed(2)}</strong>
            </div>
            <div style="margin-top:0.6rem; padding-top:0.6rem; border-top:1px solid var(--border-subtle); color:var(--text-cream-muted); font-size:0.82rem;">
              Address: ${order.delivery_address}
            </div>
          </div>

          <div style="background:rgba(212, 175, 55, 0.08); border-radius:var(--radius-sm); padding:0.85rem; margin-bottom:1.5rem; font-size:0.82rem; color:var(--gold-light);">
            ℹ️ <strong>Backend Notice:</strong> This demo order was logged to the backend API. In full production mode, notifications and payment gateway webhooks trigger automatically.
          </div>

          <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-whatsapp btn-sm" onclick="window.cart.shareOrderOnWhatsApp('${order.order_number}', '${order.customer_name}', ${order.total_amount})">
              Share Order on WhatsApp 💬
            </button>
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('orderSuccessModal').classList.remove('open')">
              Done
            </button>
          </div>
        </div>
      `;
    }

    modal.classList.add('open');
  }

  orderViaWhatsApp() {
    if (this.items.length === 0) {
      showToast('Your cart is empty. Add food items first!', 'info');
      return;
    }

    const { total } = this.getCalculations();
    let text = `👑 *NEW ORDER - PAVI'S CLUB*\n\n`;
    text += `Hello Pavi's Club! I would like to place an order:\n\n`;
    this.items.forEach(i => {
      text += `• ${i.name} × ${i.quantity} (₹${i.price * i.quantity})\n`;
    });
    text += `\n*Total Payable:* ₹${total.toFixed(2)}\n`;
    text += `\nPlease confirm availability and payment details. Thank you!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encoded}`, '_blank');
  }

  shareOrderOnWhatsApp(orderNumber, customerName, total) {
    let text = `👑 *ORDER CONFIRMATION - PAVI'S CLUB*\n\n`;
    text += `Order ID: ${orderNumber}\n`;
    text += `Customer: ${customerName}\n`;
    text += `Amount: ₹${parseFloat(total).toFixed(2)}\n\n`;
    text += `Thank you for ordering at Pavi's Club! Our kitchen is preparing your feast.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encoded}`, '_blank');
  }
}

// Global Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new CartManager();
});
