# Personal Finance Tracker

A modern web-based application for managing personal income, expenses, budgets, and financial activities with real-time balance calculations and visual analytics.

## 🚀 Technologies

- **Backend**: PHP (Object-Oriented, PDO, RESTful JSON APIs)
- **Database**: MySQL / MariaDB
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Modern Glassmorphism Design)
- **Version Control**: Git & GitHub

---

## 📦 Main Features

- 🔐 **User Authentication**: Secure registration, login with hashed passwords (`password_hash`), and session management.
- 📂 **Category Management**: Create, edit, and organize custom income and expense categories.
- 💸 **Transaction Tracking**: Add, view, edit, and delete income and expense transactions.
- 📊 **Financial Dashboard**: Real-time calculation of total income, total expenses, and net balance.
- 🕒 **Recent Activity**: Quick view of latest financial transactions.
- 🎯 **Budgets & Goals** *(Upcoming)*: Track category budgets and savings goals.

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
- **Web Server**: Apache / Nginx / XAMPP / WampServer / Laragon or PHP CLI (PHP 7.4+ or 8.x)
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB

### 2. Database Setup
1. Start your local MySQL server (default port `3306` or `3307`).
2. Open phpMyAdmin, MySQL Workbench, or your terminal and import the schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *Or create a database named `personal_finance_tracker` and execute the queries in `database/schema.sql`.*

### 3. Configure Database Connection (Optional)
Database credentials can be customized in `backend/config/database.php` or via environment variables:
- `DB_HOST` (Default: `127.0.0.1`)
- `DB_PORT` (Default: Auto-detects `3307` / `3306`)
- `DB_NAME` (Default: `personal_finance_tracker`)
- `DB_USER` (Default: `root`)
- `DB_PASS` (Default: `""`)

### 4. Running the Application
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
│   ├── api/            # JSON REST API endpoints (login, register, categories, transactions, dashboard)
│   ├── config/         # Database configuration & connection
│   ├── controllers/    # Business logic & request handling
│   ├── middleware/     # Authentication & session guards
│   └── models/         # Database interaction models
├── database/
│   ├── schema.sql      # Database table definitions & constraints
│   └── seed.sql        # Sample starter data
├── docs/
│   └── requirements.md # Functional & non-functional requirements
└── frontend/
    ├── css/            # Glassmorphic UI styling (style.css)
    ├── js/             # Application logic & API interaction (app.js)
    └── index.html      # Main user interface
```