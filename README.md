# 💰 Personal Finance Tracker

A modern, full-featured web application for managing personal income, expenses, category budgets, savings goals, and financial analytics with real-time balance calculations and visual Chart.js dashboards.

---

## 🎨 Design & Theme
- **Color Palette**: Light Purple / Lavender (`#ede9fe`), Dark Blue / Navy (`#0f172a`), Light Sky Blue (`#dbeafe`), Pastel & Vibrant Pink (`#fce7f3` / `#ec4899`), Crisp White (`#ffffff`).
- **Aesthetic**: Layered mixed ambient background glows, glassmorphic card surfaces, pastel category chips, dynamic category emojis (🍔, 💰, 🚗, 🛍️, ⚡, etc.), and smooth micro-animations.

---

## 🚀 Technologies

- **Backend**: PHP 8.x / 7.4+ (Object-Oriented, PDO, RESTful JSON APIs)
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB (Adaptive port support: `3306` / `3307`)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Vanilla CSS3 (Custom Design System)
- **Visual Analytics**: Chart.js 4.4.1 (Doughnut & Bar Charts)
- **Icons & Typography**: Font Awesome 6.5.1, Plus Jakarta Sans (Google Fonts)

---

## 📦 Main Features

1. 🔐 **User Authentication & Security**:
   - Secure registration and login with bcrypt password hashing (`PASSWORD_BCRYPT`).
   - Hardened session cookies (`HttpOnly`, `SameSite=Lax`, `session_regenerate_id`).
   - Full IDOR protection (ownership validation on transactions, categories, budgets, and goals).

2. 💎 **Interactive Financial Summary (Tier 1)**:
   - Real-time **Total Income** (Pastel Blue), **Total Expenses** (Pastel Pink), and **Net Balance** (Pastel Purple) summary cards with decorative watermarks.

3. 📊 **Visual Financial Analytics (Tier 2 - 3 Charts)**:
   - 🥧 **Expense by Category**: Doughnut chart with category breakdown and percentage tooltips.
   - 🥧 **Income by Category**: Doughnut chart showing income distribution across sources.
   - 📊 **Overall Cash Flow**: Monthly Bar Chart comparing Income vs Expenses over time.

4. 🕒 **Recent Activity Feed (Tier 3)**:
   - Chronological transactions feed with category-aware emojis (🍔 Food, 💰 Salary, 🚗 Transport, ⚡ Bills, etc.), formatted amounts (`+ Rs. ...` / `- Rs. ...`), and quick edit/delete actions.

5. 📂 **Category & Transaction Management (Tier 4)**:
   - **Category Directory**: Create and manage categories with multi-color pastel chips (Sky Blue, Pink, Purple, Mint, Amber, Cyan).
   - **Add Transaction Form**: Record income and expense entries with live zero-reload dashboard sync.

6. 🎯 **Budgets & Financial Goals**:
   - **Monthly Budgets**: Set spending limits per category and track consumption progress meters (Emerald `< 75%`, Amber `75%-99%`, Pink `≥ 100%`).
   - **Savings Goals**: Set target dates, track savings progress percentages, and deposit funds.

7. 🔍 **Search & Filter History**:
   - Search transactions by note, description, or amount, with type (Income/Expense) and category filters.

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
- **Web Server**: Apache / Nginx / XAMPP / WampServer / Laragon or PHP CLI (PHP 7.4+ or 8.x)
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB

### 2. Database Setup
1. Start your local MySQL server (default port `3306` or `3307`).
2. Open phpMyAdmin or MySQL terminal and import the schema:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p personal_finance_tracker < database/seed.sql
   ```

### 3. Running the Application
- **Using XAMPP / WAMP**: Place the project inside your `htdocs` or `www` directory and navigate to:
  ```
  http://localhost/personal-finance-tracker/frontend/index.html
  ```
- **Using PHP Built-in Server**:
  ```bash
  # Run from the project root directory
  php -S localhost:8000
  ```
  Then open `http://localhost:8000/frontend/index.html` in your browser.

---

## 📁 Project Structure

```
├── backend/
│   ├── api/            # REST API endpoints (auth, categories, transactions, dashboard, budgets, goals)
│   ├── config/         # Adaptive PDO Database connection (ports 3306/3307)
│   ├── controllers/    # Request controllers & business logic
│   ├── middleware/     # Authentication & secure session guards
│   └── models/         # PDO Data models (User, Category, Transaction, Budget, Goal, Dashboard)
├── database/
│   ├── schema.sql      # Schema definitions with foreign keys & indexes
│   └── seed.sql        # Starter data & default categories
├── docs/
│   └── requirements.md # Requirements specification
└── frontend/
    ├── css/            # Vibrant colorful design system (style.css)
    ├── js/             # Interactive SPA logic & Chart.js rendering (app.js)
    └── index.html      # 4-tier dashboard layout & modal dialogs
```