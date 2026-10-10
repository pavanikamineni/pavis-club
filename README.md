# 👑 Pavi's Club - Premium Restaurant Full-Stack Web Application

> **"Good Food. Great Taste. Unforgettable Moments."**

A complete, modern, responsive full-stack restaurant website designed for **Pavi's Club**. Features an obsidian black, royal gold, and warm cream luxury aesthetic, smooth micro-interactions, complete shopping cart with WhatsApp order sharing, table reservation system, and a comprehensive Admin Dashboard.

---

## 🌟 Key Features

### 1. Website Design & UI/UX
- **Regal Black, Gold & Cream Theme**: Tailored color palette with gold gradients, glassmorphism, and atmospheric lighting.
- **Modern Luxury Typography**: Cormorant & Cinzel brand serifs paired with Playfair Display and Plus Jakarta Sans.
- **Fully Responsive**: Flawless layout across smartphones, tablets, laptops, and ultra-wide screens.
- **Sticky Glassmorphic Navigation**: Smooth scrolling, active link indicators, and live cart counter badge.

### 2. Customer Home Experience
- **Hero Showcase**: Prominent "Welcome to Pavi's Club" headline, brand tagline, and instant action CTAs.
- **Feature Highlights Ribbon**: Showcasing master chefs, charcoal dum cooking, farm produce, and express delivery.
- **Dynamic Featured Dishes**: Instant API loading of chef's signature curations with dietary badges.
- **Special Offers & VIP Club**: Promotions with copyable coupon codes.
- **Why Choose Us**: Pillars of dining excellence (Ambiance, Heritage Recipes, White-Glove Service, Hygiene).
- **Guest Testimonials**: Authentic patron reviews.
- **Quick Table Booking**: Integrated reservation widget.

### 3. Food Menu & Ordering System
- **6 Distinct Categories**: Starters, Main Course, Biryani, Fast Food, Desserts, and Beverages.
- **Dynamic Search & Filtering**: Instant live search and category switching without page reloads.
- **Dietary Filter**: Filter by Pure Veg (🌱) or Non-Veg (🍗) specialties.
- **Clear Demo Pricing**: Prices marked as demo data, ready for live customization.

### 4. Shopping Cart & Ordering
- **Slide-out Cart Drawer**: Accessible from any page with smooth backdrop blur.
- **Quantity Adjustments**: Increment, decrement, or remove items in real-time.
- **Automatic Bill Calculations**: Subtotal, 5% GST, and conditional free delivery (free on orders over ₹500).
- **Checkout Flow**: Full customer validation (Name, Phone, Delivery Address, Notes, Payment Mode).
- **Multi-Channel Ordering**:
  - Direct checkout saving orders to backend API.
  - One-click **Order via WhatsApp** button generating an itemized bill message.

### 5. Table Reservation
- **Dedicated Booking Page & Widget**: Guest count selection, date picker with past-date prevention, seating time slots.
- **Seating Choice**: Main Dining Salon, Rooftop Terrace, or Royal VIP Lounge.
- **Backend Logging**: Reservations stored with status tracking (Pending / Confirmed / Cancelled).

### 6. About Us & Story
- **Authentic Culinary Narrative**: The founding philosophy, farm-to-table sourcing, and 36-hour slow dum simmering.
- **Private Celebrations**: Information for private events and milestone banquets.

### 7. Contact & Concierge
- **Editable Placeholders**: Phone, email, address, opening hours, and social media handles.
- **Inquiry Form**: Validated contact form saving submissions to the backend database.
- **Stylized Dark Map**: Interactive embedded map representing Jubilee Hills, Hyderabad.

### 8. Staff Portal & Admin Dashboard (`/admin`)
- **Protected Access**: Administrative authentication (Demo: `admin` / `admin123`).
- **Live Metrics**: Total Revenue, Total Orders, Pending Orders, Active Dishes, Total Reservations, and DB Status.
- **Menu Management (CRUD)**: Add dishes, edit prices/descriptions/photos, delete dishes, and toggle live stock availability.
- **Live Order Tracker**: View customer contact, address, item summary, and update order status (`Pending` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered` → `Cancelled`).
- **Reservation Desk**: Approve or decline table requests.
- **Customer Messages**: Read contact form submissions and mark as read.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with tokens), Modern JavaScript (ES6+ Asynchronous Fetch).
- **Backend**: Node.js, Express.js REST API.
- **Database**: MySQL 8.0 with `mysql2/promise` connection pool and parameterized SQL queries.
- **Resilient Fallback**: Auto-detects MySQL connection; if credentials are being configured, automatically activates the local fallback store so that all features work immediately with zero downtime.

---

## 📁 Project Directory Structure

```
pavi's club/
├── .env                  # Environment variables
├── .env.example          # Example environment template
├── .gitignore            # Git ignore
├── package.json          # Node dependencies and scripts
├── README.md             # Documentation
├── database/
│   ├── schema.sql        # MySQL table schema
│   ├── seed.sql          # Sample categories and dishes
│   └── init-db.js        # Script to auto-initialize MySQL
├── server/
│   ├── index.js          # Express server entry point
│   ├── config/
│   │   └── db.js         # MySQL pool & resilient fallback store
│   ├── controllers/      # Route controllers (Menu, Orders, etc.)
│   ├── middleware/       # Admin authentication middleware
│   ├── routes/           # REST API routes
│   └── data/             # Initial demo data and store
└── public/
    ├── index.html        # Home Page
    ├── menu.html         # Menu Page
    ├── reservation.html  # Table Reservation Page
    ├── about.html        # About Us Page
    ├── contact.html      # Contact & Map Page
    ├── admin.html        # Admin Dashboard
    ├── css/              # Theme, components, style, admin CSS
    └── js/               # Cart, menu, reservation, admin scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MySQL 8.0+** (Already installed on system)

### 2. Installation
Open a terminal in the project directory:
```bash
npm install
```

### 3. Configuring Database (.env)
Edit `.env` with your local MySQL password:
```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=pavis_club
DB_PORT=3306

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Initializing MySQL Database
Run the automated schema and seed migration:
```bash
npm run db:init
```
*Alternatively, you can open `database/schema.sql` followed by `database/seed.sql` in MySQL Workbench and execute them.*

### 5. Running the Application
Start the unified full-stack server:
```bash
npm start
```
The server will start at:
👉 **`http://localhost:5000`**

---

## 🧭 Navigation URLs

| Page | URL | Description |
| :--- | :--- | :--- |
| **Home** | `http://localhost:5000/` | Brand hero, highlights, specials, reviews |
| **Menu** | `http://localhost:5000/menu.html` | Full menu with search and filters |
| **Reservations** | `http://localhost:5000/reservation.html` | Table booking system |
| **About Us** | `http://localhost:5000/about.html` | Restaurant story and culinary craft |
| **Contact** | `http://localhost:5000/contact.html` | Contact details, inquiry form, map |
| **Admin Portal** | `http://localhost:5000/admin` | Staff dashboard (`admin` / `admin123`) |

---

## 🔐 Admin Credentials (Demo)

- **Username**: `admin`
- **Password**: `admin123`
*(Configurable via `.env` file)*

---

## 🛡️ Security & Best Practices

1. **Input Validation**: Sanitization and validation for names, phone numbers, quantities, and prices on both client and server.
2. **Parameterized Queries**: All database operations use prepared statements to prevent SQL Injection.
3. **Secret Isolation**: Secrets, credentials, and ports are loaded from environment variables and excluded via `.gitignore`.
4. **Graceful Error Handling**: Unified error-handling middleware preventing server crashes.
