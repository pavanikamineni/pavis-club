/* ========================================================
   PAVI'S CLUB - MENU PAGE SYSTEM
   ======================================================== */

let allMenuItems = [];
let activeCategory = 'all';
let activeDietary = 'all'; // 'all', 'veg', 'nonveg'
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initUrlParams();
  initSearchAndFilters();
  fetchCategories();
  fetchMenu();
});

// Check URL params for deep-link category e.g. menu.html?category=biryani
function initUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat) {
    activeCategory = cat.toLowerCase();
  }
}

// Search and Filter controls
function initSearchAndFilters() {
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Dietary buttons (Pure Veg / Non-Veg)
  const vegBtn = document.getElementById('filterVegBtn');
  const nonVegBtn = document.getElementById('filterNonVegBtn');
  const allDietBtn = document.getElementById('filterAllDietBtn');

  if (vegBtn) {
    vegBtn.addEventListener('click', () => {
      activeDietary = activeDietary === 'veg' ? 'all' : 'veg';
      updateDietaryButtons();
      applyFilters();
    });
  }

  if (nonVegBtn) {
    nonVegBtn.addEventListener('click', () => {
      activeDietary = activeDietary === 'nonveg' ? 'all' : 'nonveg';
      updateDietaryButtons();
      applyFilters();
    });
  }

  if (allDietBtn) {
    allDietBtn.addEventListener('click', () => {
      activeDietary = 'all';
      updateDietaryButtons();
      applyFilters();
    });
  }
}

function updateDietaryButtons() {
  const vegBtn = document.getElementById('filterVegBtn');
  const nonVegBtn = document.getElementById('filterNonVegBtn');
  const allDietBtn = document.getElementById('filterAllDietBtn');

  if (allDietBtn) allDietBtn.classList.toggle('active', activeDietary === 'all');
  if (vegBtn) vegBtn.classList.toggle('active', activeDietary === 'veg');
  if (nonVegBtn) nonVegBtn.classList.toggle('active', activeDietary === 'nonveg');
}

// Fetch Categories from Backend
async function fetchCategories() {
  const container = document.getElementById('categoryFilterChips');
  if (!container) return;

  try {
    const res = await fetch('/api/menu/categories');
    const data = await res.json();

    if (data.success && data.categories.length > 0) {
      let html = `
        <button class="filter-chip ${activeCategory === 'all' ? 'active' : ''}" data-category="all">
          All Offerings
        </button>
      `;

      data.categories.forEach(cat => {
        const isActive = activeCategory === cat.slug;
        html += `
          <button class="filter-chip ${isActive ? 'active' : ''}" data-category="${cat.slug}">
            ${cat.name}
          </button>
        `;
      });

      container.innerHTML = html;

      // Bind click events to category buttons
      container.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategory = btn.getAttribute('data-category');
          applyFilters();
        });
      });
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// Fetch Full Menu
async function fetchMenu() {
  const container = document.getElementById('menuDishesGrid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--gold-light);">
      <div style="font-size:2.5rem; margin-bottom:1rem;">🧑‍🍳</div>
      <p style="font-size:1.1rem;">Gathering Pavi's Club Royal Menu...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/menu');
    const data = await res.json();

    if (data.success && Array.isArray(data.items)) {
      allMenuItems = data.items;
      applyFilters();
    } else {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-cream-dim);">
          No dishes available right now.
        </div>
      `;
    }
  } catch (err) {
    console.error('Error fetching menu items:', err);
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#e74c3c;">
        Failed to connect to menu server. Please check your backend.
      </div>
    `;
  }
}

// Client-side instant filter & search
function applyFilters() {
  const container = document.getElementById('menuDishesGrid');
  const countBadge = document.getElementById('menuResultsCount');
  if (!container) return;

  let filtered = allMenuItems;

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(item => {
      const slug = item.category_slug || '';
      const name = (item.category_name || '').toLowerCase();
      return slug === activeCategory || name === activeCategory;
    });
  }

  // Dietary filter
  if (activeDietary === 'veg') {
    filtered = filtered.filter(item => Number(item.is_veg) === 1);
  } else if (activeDietary === 'nonveg') {
    filtered = filtered.filter(item => Number(item.is_veg) === 0);
  }

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(item => {
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category_name || '').toLowerCase();
      return name.includes(searchQuery) || desc.includes(searchQuery) || cat.includes(searchQuery);
    });
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Dishes Found`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <div style="font-size:3rem; margin-bottom:1rem; opacity:0.6;">🔍</div>
        <h4 style="font-size:1.3rem; color:var(--gold-light); margin-bottom:0.5rem;">No Dishes Match Your Selection</h4>
        <p style="color:var(--text-cream-dim); margin-bottom:1.5rem; font-size:0.9rem;">
          Try adjusting your search query or selecting a different category.
        </p>
        <button class="btn btn-outline btn-sm" onclick="resetAllFilters()">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(dish => renderDishCard(dish)).join('');
}

function resetAllFilters() {
  activeCategory = 'all';
  activeDietary = 'all';
  searchQuery = '';

  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) searchInput.value = '';

  const container = document.getElementById('categoryFilterChips');
  if (container) {
    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
    });
  }

  updateDietaryButtons();
  applyFilters();
}
