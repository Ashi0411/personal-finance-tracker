# 💰 Personal Finance Tracker

A modern, comprehensive, full-stack personal finance management web application. Track income and expenses, set monthly category budgets, establish savings goals, generate analytical monthly & yearly reports, and visualize your financial health with interactive Chart.js dashboards.

---

## 🌟 Key Highlights

- 💎 **Interactive 4-Tier Dashboard**: Real-time Total Income, Expenses, and Net Balance summaries with ambient glow cards and live balance synchronization.
- 📊 **Visual Analytics**: Interactive Category Breakdown Doughnut Charts and Monthly Cash Flow Bar Charts powered by Chart.js.
- 💸 **Transaction Tracking**: Add, edit, delete, search, and filter income and expense records with customizable dates, notes, and category tags.
- 🎯 **Category Budgets**: Set monthly spending limits per category with dynamic progress meters and visual alerts (Normal `< 75%`, Warning `75% - 99%`, Exceeded `≥ 100%`).
- 🏆 **Savings Goals**: Establish financial targets, specify target completion dates, and track savings progress with deposit contributions.
- 📈 **Monthly & Yearly Reports**: Comprehensive breakdown of income, expenses, net savings rate, and category distribution over time.
- 👤 **User Profile & Security**: Secure registration, bcrypt password hashing, session management, IDOR protection, and profile management with avatar uploads.

---

## 🎨 UI/UX & Design System

- **Aesthetic**: Modern glassmorphism, layered ambient background glows, smooth micro-interactions, responsive modal workflows, and dynamic category emojis (🍔, 💰, 🚗, 🛍️, ⚡, ✈️, etc.).
- **Color Palette**:
  - Primary / Net Balance: Lavender & Violet (`#ede9fe` / `#8b5cf6`)
  - Income Accent: Sky Blue & Emerald (`#dbeafe` / `#10b981`)
  - Expense Accent: Pastel & Vibrant Pink (`#fce7f3` / `#ec4899`)
  - Background & Contrast: Deep Slate Navy (`#0f172a` / `#1e293b`) & Crisp White (`#ffffff`)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for clean, modern legibility.
- **Icons**: Font Awesome 6.5.1 Free Icons.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, CSS3 | Single-Page Application (SPA) experience with custom design system |
| **Data Visualization** | [Chart.js 4.4.1](https://www.chartjs.org/) | Responsive Doughnut & Bar charts for financial breakdown |
| **Backend** | PHP 7.4+ / 8.x | Modular MVC-inspired architecture, PDO, RESTful JSON endpoints |
| **Database** | MySQL 5.7+ / 8.0+ or MariaDB | Relational schema with Foreign Keys, Cascades, and Indexes |
| **Web Server** | Apache / Nginx / PHP CLI | Adaptive MySQL port detection (`3306` / `3307`) |

---

## 📦 Main Features & Architecture

### 1. 🔐 Authentication & Session Security
- User registration and login with `password_hash()` (Bcrypt).
- Secure session cookie configuration (`HttpOnly`, `SameSite=Lax`, and periodic `session_regenerate_id()`).
- Ownership verification across all endpoints to prevent Insecure Direct Object References (IDOR).

### 2. 💳 Income & Expense Tracking
- Record transactions categorized under custom or pre-seeded categories.
- Instant search filter by transaction title, notes, or amounts.
- Multi-criteria filtering by Type (Income/Expense), Category, and Date ranges.

### 3. 📊 Visual Dashboard Analytics
- **Category Expense Breakdown**: Doughnut chart representing spending distribution by category.
- **Category Income Breakdown**: Doughnut chart showcasing income sources.
- **Cash Flow History**: Grouped bar chart comparing monthly income vs. expenses.

### 4. 🎯 Budgets & Progress Indicators
- Monthly spending targets for individual expense categories.
- Real-time percentage consumption calculations against current month's transactions.
- Multi-tier color indicators:
  - 🟢 **Safe** (`< 75%`): Green/Emerald indicator.
  - 🟡 **Warning** (`75% - 99%`): Amber indicator.
  - 🔴 **Exceeded** (`≥ 100%`): Pink/Red alert badge.

### 5. 🏆 Savings Goals
- Define goals with target amounts, current savings balance, and target target completion dates.
- Quick deposit modal to log increments toward individual savings milestones.
- Visual completion percentage rings and progress bars.

### 6. 📑 Analytical Financial Reports
- Detailed monthly and annual balance sheets.
- Savings rate calculation: `(Total Income - Total Expenses) / Total Income * 100%`.
- High-level summaries of highest spending categories and monthly averages.

---

## 🔌 API Reference

All API requests return standard JSON responses: `{"success": true|false, "data": ..., "message": "..."}`.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/backend/api/register.php` | `POST` | Create a new user account |
| `/backend/api/login.php` | `POST` | Authenticate user and initialize secure session |
| `/backend/api/logout.php` | `POST` | Terminate active user session |
| `/backend/api/auth-status.php` | `GET` | Verify active session & current user payload |
| `/backend/api/dashboard.php` | `GET` | Retrieve summary cards, recent transactions, & chart metrics |
| `/backend/api/transactions.php` | `GET`, `POST`, `PUT`, `DELETE` | CRUD operations and filters for income/expense records |
| `/backend/api/categories.php` | `GET`, `POST`, `PUT`, `DELETE` | Manage custom & default transaction categories |
| `/backend/api/budgets.php` | `GET`, `POST`, `PUT`, `DELETE` | Manage monthly category budgets and fetch usage status |
| `/backend/api/goals.php` | `GET`, `POST`, `PUT`, `DELETE` | Manage financial savings goals and log deposits |
| `/backend/api/reports.php` | `GET` | Retrieve monthly or yearly financial reports (`?type=monthly&month_year=YYYY-MM` or `?type=yearly&year=YYYY`) |
| `/backend/api/profile.php` | `GET`, `POST` | Fetch/update user details, change password, and upload avatar |

---

## 🗄️ Database Schema

The database consists of the following core tables with relational integrity:
- `users`: User profiles, hashed credentials, avatar paths, and timestamps.
- `categories`: Income and expense classification tags (supports user-specific and system defaults).
- `transactions`: Core financial ledger entries linked to `users` and `categories`.
- `budgets`: Monthly category spending limits per user.
- `goals`: Savings targets, accumulated savings, and deadlines.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **PHP**: 7.4+ or 8.x
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB
- **Web Server**: Apache / XAMPP / WampServer / Laragon or PHP Built-in Server

### 2. Clone the Repository
```bash
git clone https://github.com/Ashi0411/personal-finance-tracker.git
cd personal-finance-tracker
```

### 3. Database Configuration & Import
1. Ensure your local MySQL server is running (ports `3306` or `3307` are automatically detected).
2. Create the database and import tables using the MySQL CLI or phpMyAdmin:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS personal_finance_tracker;"
   mysql -u root -p personal_finance_tracker < database/schema.sql
   mysql -u root -p personal_finance_tracker < database/seed.sql
   ```
3. *(Optional)* If your MySQL password or host differs from the default (`root` with no password on `localhost`), adjust credentials in [backend/config/database.php](file:///d:/Projects/Personal%20Finance%20Tracker/backend/config/database.php).

### 4. Running the Application

#### Option A: Using Built-in PHP Server (Recommended for Quick Testing)
Run the following command from the project root directory:
```bash
php -S localhost:8000
```
Open your browser and navigate to:
```
http://localhost:8000/frontend/index.html
```

#### Option B: Using XAMPP / WAMP / Laragon
1. Move the project folder into your web server's root directory (`htdocs` for XAMPP or `www` for WAMP).
2. Start the Apache and MySQL modules.
3. Access the web interface in your browser:
   ```
   http://localhost/personal-finance-tracker/frontend/index.html
   ```

---

## 📁 Project Structure

```
personal-finance-tracker/
├── backend/
│   ├── api/                 # REST API endpoints
│   │   ├── auth-status.php
│   │   ├── budgets.php
│   │   ├── categories.php
│   │   ├── dashboard.php
│   │   ├── goals.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── profile.php
│   │   ├── register.php
│   │   ├── reports.php
│   │   └── transactions.php
│   ├── config/              # Adaptive PDO database connection (ports 3306/3307)
│   │   └── database.php
│   ├── controllers/         # Business logic & request validation controllers
│   │   ├── AuthController.php
│   │   ├── BudgetController.php
│   │   ├── CategoryController.php
│   │   ├── DashboardController.php
│   │   ├── GoalController.php
│   │   ├── ProfileController.php
│   │   ├── ReportController.php
│   │   ├── TransactionController.php
│   │   └── UserController.php
│   ├── middleware/          # Session authentication guards
│   │   └── auth.php
│   ├── models/              # PDO Data Access Models
│   │   ├── Budget.php
│   │   ├── Category.php
│   │   ├── Dashboard.php
│   │   ├── Goal.php
│   │   ├── Transaction.php
│   │   └── User.php
│   └── uploads/             # User avatar & media uploads directory
├── database/
│   ├── schema.sql           # Complete relational schema & indexes
│   └── seed.sql             # Default category and starter data
├── docs/
│   └── requirements.md      # Specification & requirements document
└── frontend/
    ├── css/
    │   └── style.css        # Design system, glassmorphism & animations
    ├── images/              # Static assets & icons
    ├── js/
    │   └── app.js           # Client-side SPA routing, Chart.js & AJAX controllers
    └── index.html           # Unified responsive UI layout & modal views
```

---

## 🔒 Security Practices

- **Prepared Statements**: All SQL queries utilize parameterized PDO statements to prevent SQL Injection.
- **Cross-Site Scripting (XSS) Prevention**: User inputs are sanitized and encoded before rendering.
- **Cross-Site Request Forgery & Session Hardening**: Session cookies use `SameSite=Lax` and `HttpOnly` flags.
- **IDOR Protection**: Strict user session checks ensure users can only view, edit, or delete their own data.
- **Password Security**: Passwords are saved strictly as bcrypt hashes via `password_hash()` and verified with `password_verify()`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).