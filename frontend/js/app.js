/**
 * Personal Finance Tracker - Main Application Logic
 * Compact 2-Column Minimalist Architecture
 */

// ============================================================
// API ENDPOINTS
// ============================================================
const REGISTER_API_URL    = "../backend/api/register.php";
const LOGIN_API_URL       = "../backend/api/login.php";
const LOGOUT_API_URL      = "../backend/api/logout.php";
const AUTH_STATUS_API_URL = "../backend/api/auth-status.php";
const CATEGORY_API_URL    = "../backend/api/categories.php";
const DASHBOARD_API_URL   = "../backend/api/dashboard.php";
const TRANSACTION_API_URL = "../backend/api/transactions.php";
const BUDGET_API_URL      = "../backend/api/budgets.php";
const GOAL_API_URL        = "../backend/api/goals.php";
const REPORT_API_URL      = "../backend/api/reports.php";

// App State
let userCategories = [];
let allTransactions = [];
let userBudgets = [];
let userGoals = [];
let currentMonthlyReport = null;
let activeOverviewMonth = new Date().toISOString().slice(0, 7);
let activeTab = "overview";
let categoryExpenseChartInstance = null;
let categoryIncomeChartInstance = null;
let cashFlowChartInstance = null;

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    await checkSession();
});

// ============================================================
// SESSION MANAGEMENT
// ============================================================
async function checkSession() {
    try {
        const response = await fetch(AUTH_STATUS_API_URL);
        const data = await response.json();

        if (data.success && data.authenticated && data.user) {
            setUserLoggedIn(data.user);
            await loadAllUserData();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error("Session check error:", error);
        showLogin();
    }
}

function setUserLoggedIn(user) {
    const authSection = document.getElementById("authSection");
    const financeSection = document.getElementById("financeSection");
    const userProfileBar = document.getElementById("userProfileBar");
    const appNav = document.getElementById("appNav");
    const heroBanner = document.getElementById("heroBanner");
    const userNameDisplay = document.getElementById("userNameDisplay");

    if (authSection) authSection.style.display = "none";
    if (financeSection) financeSection.style.display = "block";
    if (userProfileBar) userProfileBar.style.display = "flex";
    if (appNav) appNav.style.display = "flex";
    if (heroBanner) heroBanner.style.display = "flex";
    if (userNameDisplay) userNameDisplay.textContent = user.name || "User";

    // Set today's date as default in transaction date input
    const dateInput = document.getElementById("transactionDate");
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Set active month in overview month picker
    const overviewPicker = document.getElementById("overviewMonthPicker");
    if (overviewPicker) {
        overviewPicker.value = activeOverviewMonth;
    }

    // Set current month in budget month picker
    const monthPicker = document.getElementById("budgetMonthPicker");
    if (monthPicker && !monthPicker.value) {
        monthPicker.value = activeOverviewMonth;
    }
}

async function loadAllUserData() {
    await loadCategories();
    await loadTransactions();
    await loadDashboard(activeOverviewMonth);
    await loadBudgets();
    await loadGoals();
}

// ============================================================
// EVENT LISTENERS SETUP
// ============================================================
function setupEventListeners() {
    // 1. Auth Forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", handleRegister);

    const showRegisterButton = document.getElementById("showRegisterButton");
    if (showRegisterButton) showRegisterButton.addEventListener("click", showRegister);

    const showLoginButton = document.getElementById("showLoginButton");
    if (showLoginButton) showLoginButton.addEventListener("click", showLogin);

    const headerLogoutButton = document.getElementById("headerLogoutButton");
    if (headerLogoutButton) headerLogoutButton.addEventListener("click", logout);

    // 2. Tab Navigation
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    const viewAllBtn = document.getElementById("viewAllTxBtn");
    if (viewAllBtn) viewAllBtn.addEventListener("click", () => switchTab("transactions"));

    const manageCatLink = document.getElementById("manageCategoriesLink");
    if (manageCatLink) manageCatLink.addEventListener("click", () => switchTab("categories"));

    // 3. Quick Type Radio Toggles
    const typeExpRadio = document.getElementById("typeExpenseRadio");
    const typeIncRadio = document.getElementById("typeIncomeRadio");
    const txTypeHidden = document.getElementById("transactionType");

    if (typeExpRadio && txTypeHidden) {
        typeExpRadio.addEventListener("change", () => { txTypeHidden.value = "expense"; });
    }
    if (typeIncRadio && txTypeHidden) {
        typeIncRadio.addEventListener("change", () => { txTypeHidden.value = "income"; });
    }

    // 4. Forms
    const categoryForm = document.getElementById("categoryForm");
    if (categoryForm) categoryForm.addEventListener("submit", handleCreateCategoryQuick);

    const categoryFormTab = document.getElementById("categoryFormTab");
    if (categoryFormTab) categoryFormTab.addEventListener("submit", handleCreateCategoryTab);

    const transactionForm = document.getElementById("transactionForm");
    if (transactionForm) transactionForm.addEventListener("submit", handleCreateTransaction);

    const budgetForm = document.getElementById("budgetForm");
    if (budgetForm) budgetForm.addEventListener("submit", handleCreateBudget);

    const goalForm = document.getElementById("goalForm");
    if (goalForm) goalForm.addEventListener("submit", handleCreateGoal);

    const budgetMonthPicker = document.getElementById("budgetMonthPicker");
    if (budgetMonthPicker) budgetMonthPicker.addEventListener("change", () => loadBudgets(budgetMonthPicker.value));

    // 5. Search & Filter Inputs
    const searchInput = document.getElementById("txSearchInput");
    const typeFilter = document.getElementById("txTypeFilter");
    const catFilter = document.getElementById("txCategoryFilter");

    if (searchInput) searchInput.addEventListener("input", applyTransactionFilters);
    if (typeFilter) typeFilter.addEventListener("change", applyTransactionFilters);
    if (catFilter) catFilter.addEventListener("change", applyTransactionFilters);

    // 6. Modal Handlers
    // Category Modal
    const closeCatBtn = document.getElementById("closeCategoryModalBtn");
    const cancelCatBtn = document.getElementById("cancelCategoryModalBtn");
    if (closeCatBtn) closeCatBtn.addEventListener("click", closeCategoryModal);
    if (cancelCatBtn) cancelCatBtn.addEventListener("click", closeCategoryModal);
    const editCategoryForm = document.getElementById("editCategoryForm");
    if (editCategoryForm) editCategoryForm.addEventListener("submit", handleUpdateCategory);

    // Transaction Modal
    const closeTxBtn = document.getElementById("closeTransactionModalBtn");
    const cancelTxBtn = document.getElementById("cancelTransactionModalBtn");
    if (closeTxBtn) closeTxBtn.addEventListener("click", closeTransactionModal);
    if (cancelTxBtn) cancelTxBtn.addEventListener("click", closeTransactionModal);
    const editTransactionForm = document.getElementById("editTransactionForm");
    if (editTransactionForm) editTransactionForm.addEventListener("submit", handleUpdateTransaction);

    // Budget Modal
    const closeBudgetBtn = document.getElementById("closeBudgetModalBtn");
    const cancelBudgetBtn = document.getElementById("cancelBudgetModalBtn");
    if (closeBudgetBtn) closeBudgetBtn.addEventListener("click", closeBudgetModal);
    if (cancelBudgetBtn) cancelBudgetBtn.addEventListener("click", closeBudgetModal);
    const editBudgetForm = document.getElementById("editBudgetForm");
    if (editBudgetForm) editBudgetForm.addEventListener("submit", handleUpdateBudget);

    // Goal Deposit Modal
    const closeDepBtn = document.getElementById("closeDepositModalBtn");
    const cancelDepBtn = document.getElementById("cancelDepositModalBtn");
    if (closeDepBtn) closeDepBtn.addEventListener("click", closeDepositModal);
    if (cancelDepBtn) cancelDepBtn.addEventListener("click", closeDepositModal);
    const depositGoalForm = document.getElementById("depositGoalForm");
    if (depositGoalForm) depositGoalForm.addEventListener("submit", handleDepositGoal);

    // Goal Edit Modal
    const closeGoalBtn = document.getElementById("closeGoalModalBtn");
    const cancelGoalBtn = document.getElementById("cancelGoalModalBtn");
    if (closeGoalBtn) closeGoalBtn.addEventListener("click", closeGoalModal);
    if (cancelGoalBtn) cancelGoalBtn.addEventListener("click", closeGoalModal);
    const editGoalForm = document.getElementById("editGoalForm");
    if (editGoalForm) editGoalForm.addEventListener("submit", handleUpdateGoal);

    // Overview Month Switcher
    const overviewMonthPicker = document.getElementById("overviewMonthPicker");
    const prevOverviewMonthBtn = document.getElementById("prevOverviewMonthBtn");
    const nextOverviewMonthBtn = document.getElementById("nextOverviewMonthBtn");

    if (overviewMonthPicker) {
        overviewMonthPicker.value = activeOverviewMonth;
        overviewMonthPicker.addEventListener("change", (e) => {
            activeOverviewMonth = e.target.value || new Date().toISOString().slice(0, 7);
            refreshOverviewForMonth(activeOverviewMonth);
        });
    }

    if (prevOverviewMonthBtn) {
        prevOverviewMonthBtn.addEventListener("click", () => changeOverviewMonth(-1));
    }

    if (nextOverviewMonthBtn) {
        nextOverviewMonthBtn.addEventListener("click", () => changeOverviewMonth(1));
    }

    // Monthly Report Modal
    const openReportBtn = document.getElementById("openReportBtn");
    const closeReportBtn = document.getElementById("closeReportModalBtn");
    const printReportBtn = document.getElementById("printReportBtn");
    const downloadReportCsvBtn = document.getElementById("downloadReportCsvBtn");
    const reportMonthPicker = document.getElementById("reportMonthPicker");

    if (openReportBtn) openReportBtn.addEventListener("click", openMonthlyReportModal);
    if (closeReportBtn) closeReportBtn.addEventListener("click", closeMonthlyReportModal);
    if (printReportBtn) printReportBtn.addEventListener("click", printMonthlyReport);
    if (downloadReportCsvBtn) downloadReportCsvBtn.addEventListener("click", downloadMonthlyReportCSV);
    if (reportMonthPicker) reportMonthPicker.addEventListener("change", () => loadMonthlyReport(reportMonthPicker.value));

    // Close on Escape or Backdrop click
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCategoryModal();
            closeTransactionModal();
            closeBudgetModal();
            closeDepositModal();
            closeGoalModal();
            closeMonthlyReportModal();
        }
    });

    ["editCategoryModal", "editTransactionModal", "editBudgetModal", "depositGoalModal", "editGoalModal", "monthlyReportModal"].forEach(id => {
        const m = document.getElementById(id);
        if (m) {
            m.addEventListener("click", (e) => {
                if (e.target === m) {
                    closeCategoryModal();
                    closeTransactionModal();
                    closeBudgetModal();
                    closeDepositModal();
                    closeGoalModal();
                    closeMonthlyReportModal();
                }
            });
        }
    });
}

// ============================================================
// DYNAMIC MONTH SWITCHER LOGIC (OVERVIEW)
// ============================================================
function changeOverviewMonth(delta) {
    if (!activeOverviewMonth) {
        activeOverviewMonth = new Date().toISOString().slice(0, 7);
    }

    const [yearStr, monthStr] = activeOverviewMonth.split("-");
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + delta;

    if (month < 1) {
        month = 12;
        year -= 1;
    } else if (month > 12) {
        month = 1;
        year += 1;
    }

    activeOverviewMonth = `${year}-${String(month).padStart(2, '0')}`;
    
    const picker = document.getElementById("overviewMonthPicker");
    if (picker) picker.value = activeOverviewMonth;

    refreshOverviewForMonth(activeOverviewMonth);
}

async function refreshOverviewForMonth(monthYear) {
    if (!monthYear) {
        monthYear = activeOverviewMonth;
    }
    await loadDashboard(monthYear);
    updateVisualCharts(monthYear);
    renderRecentTransactions(allTransactions, monthYear);
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(tabName) {
    activeTab = tabName;

    // Update nav tab buttons
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    // Toggle Tab Panes
    const tabOverview = document.getElementById("tabOverview");
    const tabTransactions = document.getElementById("tabTransactions");
    const tabBudgets = document.getElementById("tabBudgets");
    const tabCategories = document.getElementById("tabCategories");

    if (tabOverview) tabOverview.style.display = tabName === "overview" ? "block" : "none";
    if (tabTransactions) tabTransactions.style.display = tabName === "transactions" ? "block" : "none";
    if (tabBudgets) tabBudgets.style.display = tabName === "budgets" ? "block" : "none";
    if (tabCategories) tabCategories.style.display = tabName === "categories" ? "block" : "none";

    if (tabName === "budgets") {
        loadBudgets();
        loadGoals();
    }
}

// ============================================================
// VIEW SWITCHING (Auth)
// ============================================================
function showLogin() {
    const authSection = document.getElementById("authSection");
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const financeSection = document.getElementById("financeSection");
    const userProfileBar = document.getElementById("userProfileBar");
    const appNav = document.getElementById("appNav");
    const heroBanner = document.getElementById("heroBanner");

    if (authSection) authSection.style.display = "flex";
    if (loginSection) loginSection.style.display = "block";
    if (registerSection) registerSection.style.display = "none";
    if (financeSection) financeSection.style.display = "none";
    if (userProfileBar) userProfileBar.style.display = "none";
    if (appNav) appNav.style.display = "none";
    if (heroBanner) heroBanner.style.display = "none";

    clearAuthMessages();
}

function showRegister() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    if (loginSection) loginSection.style.display = "none";
    if (registerSection) registerSection.style.display = "block";

    clearAuthMessages();
}

function clearAuthMessages() {
    const loginMsg = document.getElementById("loginMessage");
    const regMsg = document.getElementById("registerMessage");
    if (loginMsg) { loginMsg.textContent = ""; loginMsg.className = "feedback-msg"; }
    if (regMsg) { regMsg.textContent = ""; regMsg.className = "feedback-msg"; }
}

function showFeedback(elementId, message, isSuccess = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `feedback-msg ${isSuccess ? "msg-success" : "msg-error"}`;
}

// ============================================================
// AUTHENTICATION LOGIC
// ============================================================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showFeedback("registerMessage", "Please fill in all fields.");
        return;
    }

    if (password.length < 8) {
        showFeedback("registerMessage", "Password must be at least 8 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showFeedback("registerMessage", "Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(REGISTER_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback("registerMessage", data.message || "Registration failed.");
            return;
        }

        showFeedback("registerMessage", data.message, true);
        document.getElementById("registerForm").reset();

        setTimeout(() => {
            showLogin();
            const loginEmail = document.getElementById("loginEmail");
            if (loginEmail) loginEmail.value = email;
            showFeedback("loginMessage", "Account created! Please sign in.", true);
        }, 1200);

    } catch (error) {
        console.error("Register error:", error);
        showFeedback("registerMessage", "An unexpected error occurred.");
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showFeedback("loginMessage", "Email and password are required.");
        return;
    }

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback("loginMessage", data.message || "Login failed.");
            return;
        }

        document.getElementById("loginForm").reset();
        setUserLoggedIn(data.user);
        await loadAllUserData();

    } catch (error) {
        console.error("Login error:", error);
        showFeedback("loginMessage", "An unexpected error occurred during login.");
    }
}

async function logout() {
    try {
        await fetch(LOGOUT_API_URL, { method: "POST" });
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        userCategories = [];
        allTransactions = [];
        showLogin();
        showFeedback("loginMessage", "You have been logged out.", true);
    }
}

// ============================================================
// CATEGORY MANAGEMENT
// ============================================================
async function loadCategories() {
    const categoryChips = document.getElementById("categoryChipsContainer");
    const categorySelect = document.getElementById("transactionCategory");
    const modalCategorySelect = document.getElementById("editTransactionCategory");
    const filterCategorySelect = document.getElementById("txCategoryFilter");
    const budgetCatSelect = document.getElementById("budgetCategory");
    const editBudgetCatSelect = document.getElementById("editBudgetCategory");
    const categoryListTab = document.getElementById("categoryListTab");

    try {
        const response = await fetch(CATEGORY_API_URL);
        const data = await response.json();

        if (!data.success || !data.categories) {
            userCategories = [];
            return;
        }

        userCategories = data.categories;

        // 1. Populate Dropdowns
        const defaultOption = '<option value="">Select Category</option>';
        const optionsHtml = userCategories
            .map(cat => `<option value="${cat.category_id}">${escapeHtml(cat.name)}</option>`)
            .join("");

        if (categorySelect) categorySelect.innerHTML = defaultOption + optionsHtml;
        if (modalCategorySelect) modalCategorySelect.innerHTML = defaultOption + optionsHtml;
        if (filterCategorySelect) filterCategorySelect.innerHTML = '<option value="">All Categories</option>' + optionsHtml;
        if (budgetCatSelect) budgetCatSelect.innerHTML = defaultOption + optionsHtml;
        if (editBudgetCatSelect) editBudgetCatSelect.innerHTML = defaultOption + optionsHtml;

        // 2. Populate Quick Chips (Bottom Left Card)
        if (categoryChips) {
            categoryChips.innerHTML = "";
            const colorClasses = ["chip-purple", "chip-pink", "chip-blue", "chip-green", "chip-amber", "chip-cyan"];
            userCategories.forEach((cat, index) => {
                const chip = document.createElement("span");
                const colorClass = colorClasses[index % colorClasses.length];
                const emoji = getCategoryEmoji(cat.name);
                chip.className = `category-chip ${colorClass}`;
                chip.innerHTML = `
                    <span class="chip-label">${emoji} ${escapeHtml(cat.name)}</span>
                    <span class="chip-actions">
                        <button type="button" class="chip-btn edit-chip" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="chip-btn del-chip" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </span>
                `;
                chip.querySelector(".edit-chip").addEventListener("click", () => openCategoryModal(cat.category_id, cat.name));
                chip.querySelector(".del-chip").addEventListener("click", () => deleteCategory(cat.category_id, cat.name));
                categoryChips.appendChild(chip);
            });
        }

        // 3. Populate Category Tab List (Tab 4)
        if (categoryListTab) {
            categoryListTab.innerHTML = "";
            userCategories.forEach(cat => {
                const li = document.createElement("li");
                const emoji = getCategoryEmoji(cat.name);
                li.innerHTML = `
                    <span class="cat-tab-item">
                        <span class="cat-icon-badge">${emoji}</span>
                        <strong class="cat-name-text">${escapeHtml(cat.name)}</strong>
                    </span>
                    <div class="item-btns">
                        <button type="button" class="btn-mini edit-cat" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="btn-mini del del-cat" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                li.querySelector(".edit-cat").addEventListener("click", () => openCategoryModal(cat.category_id, cat.name));
                li.querySelector(".del-cat").addEventListener("click", () => deleteCategory(cat.category_id, cat.name));
                categoryListTab.appendChild(li);
            });
        }

    } catch (error) {
        console.error("Categories loading error:", error);
    }
}

async function handleCreateCategoryQuick(e) {
    e.preventDefault();
    const input = document.getElementById("categoryName");
    await createCategory(input.value.trim(), input, "categoryMessage");
}

async function handleCreateCategoryTab(e) {
    e.preventDefault();
    const input = document.getElementById("categoryNameTab");
    await createCategory(input.value.trim(), input, "categoryTabMessage");
}

async function createCategory(name, inputElement, messageElementId) {
    if (!name) {
        showFeedback(messageElementId, "Category name is required.");
        return;
    }

    try {
        const response = await fetch(CATEGORY_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback(messageElementId, data.message || "Failed to create category.");
            return;
        }

        if (inputElement) inputElement.value = "";
        showFeedback(messageElementId, "Category added!", true);
        await loadCategories();

    } catch (error) {
        console.error("Create category error:", error);
        showFeedback(messageElementId, "Error adding category.");
    }
}

function openCategoryModal(categoryId, currentName) {
    document.getElementById("editCategoryId").value = categoryId;
    document.getElementById("editCategoryName").value = currentName;
    const modal = document.getElementById("editCategoryModal");
    if (modal) modal.style.display = "flex";
}

function closeCategoryModal() {
    const modal = document.getElementById("editCategoryModal");
    if (modal) modal.style.display = "none";
}

async function handleUpdateCategory(e) {
    e.preventDefault();
    const categoryId = parseInt(document.getElementById("editCategoryId").value);
    const name = document.getElementById("editCategoryName").value.trim();

    if (!categoryId || !name) return;

    try {
        const response = await fetch(CATEGORY_API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: categoryId, name })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to update category.");
            return;
        }

        closeCategoryModal();
        await loadCategories();
        await loadTransactions();

    } catch (error) {
        console.error("Update category error:", error);
        alert("Error updating category.");
    }
}

async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
        return;
    }

    try {
        const response = await fetch(CATEGORY_API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: categoryId })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to delete category.");
            return;
        }

        await loadCategories();
        await loadTransactions();
        await loadDashboard();

    } catch (error) {
        console.error("Delete category error:", error);
    }
}

/// ============================================================
// TRANSACTION MANAGEMENT
// ============================================================
async function loadTransactions() {
    try {
        const response = await fetch(TRANSACTION_API_URL);
        const data = await response.json();

        if (!data.success || !data.transactions) {
            allTransactions = [];
        } else {
            allTransactions = data.transactions;
        }

        renderRecentTransactions(allTransactions, activeOverviewMonth);
        applyTransactionFilters();
        updateVisualCharts(activeOverviewMonth);

    } catch (error) {
        console.error("Transactions loading error:", error);
    }
}

function renderRecentTransactions(transactions, monthYear) {
    const recentList = document.getElementById("recentTransactionsList");
    const recentMsg = document.getElementById("recentTransactionsMessage");

    if (!recentList) return;
    recentList.innerHTML = "";

    const targetMonth = monthYear || activeOverviewMonth || new Date().toISOString().slice(0, 7);

    // Filter transactions for target month
    let monthlyTx = (transactions || []).filter(tx => (tx.transaction_date || '').startsWith(targetMonth));

    // If no transactions in this month, display informative message
    if (monthlyTx.length === 0) {
        if (recentMsg) {
            recentMsg.style.display = "block";
            recentMsg.textContent = "No transactions recorded for this month.";
        }
        return;
    }

    if (recentMsg) recentMsg.style.display = "none";

    const top5 = [...monthlyTx]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 6);

    top5.forEach(tx => {
        const li = buildTransactionLi(tx);
        recentList.appendChild(li);
    });
}

function applyTransactionFilters() {
    const searchInput = document.getElementById("txSearchInput");
    const typeFilter = document.getElementById("txTypeFilter");
    const catFilter = document.getElementById("txCategoryFilter");
    const transactionList = document.getElementById("transactionList");
    const txMsg = document.getElementById("transactionMessage");

    if (!transactionList) return;
    transactionList.innerHTML = "";

    const query = (searchInput ? searchInput.value.toLowerCase().trim() : "");
    const typeVal = (typeFilter ? typeFilter.value : "");
    const catVal = (catFilter ? catFilter.value : "");

    const filtered = allTransactions.filter(tx => {
        const desc = (tx.description || "").toLowerCase();
        const catName = (tx.category_name || "").toLowerCase();
        const matchesSearch = !query || desc.includes(query) || catName.includes(query);
        const matchesType = !typeVal || tx.type === typeVal;
        const matchesCat = !catVal || String(tx.category_id) === catVal;
        return matchesSearch && matchesType && matchesCat;
    });

    if (filtered.length === 0) {
        if (txMsg) txMsg.textContent = "No matching transactions found.";
        return;
    }

    if (txMsg) txMsg.textContent = "";

    filtered.forEach(tx => {
        const li = buildTransactionLi(tx);
        transactionList.appendChild(li);
    });
}

// Category Emoji Helper for Colorful Visuals
function getCategoryEmoji(name) {
    if (!name) return "🏷️";
    const lower = name.toLowerCase();
    if (lower.includes("food") || lower.includes("grocer") || lower.includes("dine") || lower.includes("meal") || lower.includes("snack") || lower.includes("restaurant")) return "🍔";
    if (lower.includes("salary") || lower.includes("wage") || lower.includes("income") || lower.includes("paycheck")) return "💰";
    if (lower.includes("shop") || lower.includes("cloth") || lower.includes("mall") || lower.includes("buy")) return "🛍️";
    if (lower.includes("trans") || lower.includes("fuel") || lower.includes("gas") || lower.includes("car") || lower.includes("uber") || lower.includes("bus") || lower.includes("train")) return "🚗";
    if (lower.includes("bill") || lower.includes("util") || lower.includes("elect") || lower.includes("water") || lower.includes("power")) return "⚡";
    if (lower.includes("movie") || lower.includes("entertain") || lower.includes("game") || lower.includes("subscrip") || lower.includes("netflix")) return "🎬";
    if (lower.includes("health") || lower.includes("medic") || lower.includes("doctor") || lower.includes("pharm")) return "🏥";
    if (lower.includes("edu") || lower.includes("book") || lower.includes("course") || lower.includes("school") || lower.includes("tutor")) return "📚";
    if (lower.includes("rent") || lower.includes("house") || lower.includes("home") || lower.includes("flat")) return "🏠";
    if (lower.includes("invest") || lower.includes("stock") || lower.includes("crypto") || lower.includes("dividend")) return "📈";
    if (lower.includes("gift") || lower.includes("bonus")) return "🎁";
    if (lower.includes("travel") || lower.includes("trip") || lower.includes("flight") || lower.includes("hotel")) return "✈️";
    if (lower.includes("pet") || lower.includes("vet")) return "🐾";
    return "🏷️";
}

function buildTransactionLi(tx) {
    const isIncome = tx.type === "income";
    const amountFormatted = parseFloat(tx.amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const emoji = getCategoryEmoji(tx.category_name);

    const li = document.createElement("li");
    li.className = `activity-item ${isIncome ? 'item-is-income' : 'item-is-expense'}`;
    li.innerHTML = `
        <div class="item-left">
            <div class="item-emoji-avatar ${isIncome ? 'avatar-income' : 'avatar-expense'}">
                ${emoji}
            </div>
            <div class="item-text">
                <span class="item-heading">${escapeHtml(tx.description || tx.category_name || 'Transaction')}</span>
                <span class="item-subtext">
                    <span class="type-pill ${isIncome ? 'pill-income' : 'pill-expense'}">
                        <i class="fa-solid ${isIncome ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                        ${isIncome ? 'Income' : 'Expense'}
                    </span>
                    <span class="subtext-sep">&bull;</span>
                    ${escapeHtml(tx.category_name || 'Uncategorized')}
                    <span class="subtext-sep">&bull;</span>
                    ${escapeHtml(tx.transaction_date)}
                </span>
            </div>
        </div>
        <div class="item-right">
            <span class="item-sum ${isIncome ? 'sum-income' : 'sum-expense'}">
                ${isIncome ? '+' : '-'} Rs. ${amountFormatted}
            </span>
            <div class="item-btns">
                <button type="button" class="btn-mini edit-tx-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="btn-mini del delete-tx-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;

    li.querySelector(".edit-tx-btn").addEventListener("click", () => openTransactionModal(tx));
    li.querySelector(".delete-tx-btn").addEventListener("click", () => deleteTransaction(tx.transaction_id));

    return li;
}

async function handleCreateTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("transactionAmount").value);
    const type = document.getElementById("transactionType").value;
    const categoryId = parseInt(document.getElementById("transactionCategory").value);
    const transactionDate = document.getElementById("transactionDate").value;
    const description = document.getElementById("transactionDescription").value.trim();

    if (!amount || amount <= 0 || !type || !categoryId || !transactionDate) {
        showFeedback("quickTransactionMessage", "Please fill in all required fields.");
        return;
    }

    try {
        const response = await fetch(TRANSACTION_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category_id: categoryId,
                amount: amount,
                type: type,
                description: description,
                transaction_date: transactionDate
            })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback("quickTransactionMessage", data.message || "Failed to add entry.");
            return;
        }

        document.getElementById("transactionAmount").value = "";
        document.getElementById("transactionDescription").value = "";

        showFeedback("quickTransactionMessage", "Entry recorded!", true);
        await loadTransactions();
        await refreshOverviewForMonth(activeOverviewMonth);

    } catch (error) {
        console.error("Create transaction error:", error);
        showFeedback("quickTransactionMessage", "Error saving entry.");
    }
}

function openTransactionModal(tx) {
    document.getElementById("editTransactionId").value = tx.transaction_id;
    document.getElementById("editTransactionAmount").value = tx.amount;
    document.getElementById("editTransactionType").value = tx.type;
    document.getElementById("editTransactionCategory").value = tx.category_id;
    document.getElementById("editTransactionDate").value = tx.transaction_date;
    document.getElementById("editTransactionDescription").value = tx.description || "";

    const modal = document.getElementById("editTransactionModal");
    if (modal) modal.style.display = "flex";
}

function closeTransactionModal() {
    const modal = document.getElementById("editTransactionModal");
    if (modal) modal.style.display = "none";
}

async function handleUpdateTransaction(e) {
    e.preventDefault();

    const transactionId = parseInt(document.getElementById("editTransactionId").value);
    const amount = parseFloat(document.getElementById("editTransactionAmount").value);
    const type = document.getElementById("editTransactionType").value;
    const categoryId = parseInt(document.getElementById("editTransactionCategory").value);
    const transactionDate = document.getElementById("editTransactionDate").value;
    const description = document.getElementById("editTransactionDescription").value.trim();

    if (!transactionId || !amount || amount <= 0 || !type || !categoryId || !transactionDate) {
        alert("Please fill all required fields.");
        return;
    }

    try {
        const response = await fetch(TRANSACTION_API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                transaction_id: transactionId,
                category_id: categoryId,
                amount: amount,
                type: type,
                description: description,
                transaction_date: transactionDate
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to update entry.");
            return;
        }

        closeTransactionModal();
        await loadTransactions();
        await refreshOverviewForMonth(activeOverviewMonth);

    } catch (error) {
        console.error("Update transaction error:", error);
        alert("Error updating entry.");
    }
}

async function deleteTransaction(transactionId) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    try {
        const response = await fetch(TRANSACTION_API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction_id: transactionId })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to delete transaction.");
            return;
        }

        await loadTransactions();
        await refreshOverviewForMonth(activeOverviewMonth);

    } catch (error) {
        console.error("Delete transaction error:", error);
    }
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard(monthYear) {
    const targetMonth = monthYear || activeOverviewMonth || new Date().toISOString().slice(0, 7);

    try {
        const response = await fetch(`${DASHBOARD_API_URL}?month_year=${targetMonth}`);
        const data = await response.json();

        if (!data.success || !data.summary) return;

        const summary = data.summary;

        const formatCurrency = (val) =>
            "Rs. " + parseFloat(val || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        const picker = document.getElementById("overviewMonthPicker");
        if (picker && picker.value !== summary.month_year) {
            picker.value = summary.month_year;
        }

        document.getElementById("totalIncome").textContent = formatCurrency(summary.total_income);
        document.getElementById("totalExpenses").textContent = formatCurrency(summary.total_expenses);
        document.getElementById("balance").textContent = formatCurrency(summary.balance);

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}

// ============================================================
// VISUAL ANALYTICS & CHARTS (Chart.js)
// ============================================================
function updateVisualCharts(monthYear) {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js not loaded.");
        return;
    }

    const targetMonth = monthYear || activeOverviewMonth || new Date().toISOString().slice(0, 7);

    renderCategoryExpenseChart(targetMonth);
    renderCategoryIncomeChart(targetMonth);
    renderCashFlowChart();
}

// 1. EXPENSE BY CATEGORY (PIE / DOUGHNUT - SELECTED MONTH)
function renderCategoryExpenseChart(monthYear) {
    const canvas = document.getElementById("categoryExpenseChart");
    const emptyState = document.getElementById("categoryChartEmpty");
    if (!canvas) return;

    const targetMonth = monthYear || activeOverviewMonth || new Date().toISOString().slice(0, 7);
    
    // Filter for selected month's expenses
    let expenses = allTransactions.filter(t => t.type === "expense" && (t.transaction_date || '').startsWith(targetMonth));

    if (expenses.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        canvas.style.display = "none";
        if (categoryExpenseChartInstance) {
            categoryExpenseChartInstance.destroy();
            categoryExpenseChartInstance = null;
        }
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    canvas.style.display = "block";

    // Aggregate by category
    const categoryTotals = {};
    let totalExpenseSum = 0;
    expenses.forEach(tx => {
        const cat = tx.category_name || "Uncategorized";
        const amt = parseFloat(tx.amount || 0);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalExpenseSum += amt;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Pink / Purple / Amber Palette
    const colors = [
        "#ec4899", "#f43f5e", "#d946ef", "#a855f7", 
        "#6366f1", "#f59e0b", "#06b6d4", "#10b981", 
        "#fb7185", "#c084fc", "#38bdf8", "#fbbf24"
    ];

    if (categoryExpenseChartInstance) {
        categoryExpenseChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    categoryExpenseChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: { size: 10.5, family: "Plus Jakarta Sans" },
                        color: "#475569"
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = parseFloat(context.raw || 0);
                            const pct = totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(1) : 0;
                            const formatted = val.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            return ` ${context.label}: Rs. ${formatted} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: "60%"
        }
    });
}

// 2. INCOME BY CATEGORY (PIE / DOUGHNUT - SELECTED MONTH)
function renderCategoryIncomeChart(monthYear) {
    const canvas = document.getElementById("categoryIncomeChart");
    const emptyState = document.getElementById("categoryIncomeChartEmpty");
    if (!canvas) return;

    const targetMonth = monthYear || activeOverviewMonth || new Date().toISOString().slice(0, 7);
    
    // Filter for selected month's income
    let incomes = allTransactions.filter(t => t.type === "income" && (t.transaction_date || '').startsWith(targetMonth));

    if (incomes.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        canvas.style.display = "none";
        if (categoryIncomeChartInstance) {
            categoryIncomeChartInstance.destroy();
            categoryIncomeChartInstance = null;
        }
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    canvas.style.display = "block";

    // Aggregate by category
    const categoryTotals = {};
    let totalIncomeSum = 0;
    incomes.forEach(tx => {
        const cat = tx.category_name || "Uncategorized";
        const amt = parseFloat(tx.amount || 0);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalIncomeSum += amt;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Blue / Cyan / Mint Palette
    const colors = [
        "#0284c7", "#0ea5e9", "#06b6d4", "#10b981", 
        "#38bdf8", "#6366f1", "#8b5cf6", "#14b8a6", 
        "#3b82f6", "#22c55e", "#a855f7", "#64748b"
    ];

    if (categoryIncomeChartInstance) {
        categoryIncomeChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    categoryIncomeChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: { size: 10.5, family: "Plus Jakarta Sans" },
                        color: "#475569"
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = parseFloat(context.raw || 0);
                            const pct = totalIncomeSum > 0 ? ((val / totalIncomeSum) * 100).toFixed(1) : 0;
                            const formatted = val.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            return ` ${context.label}: Rs. ${formatted} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: "60%"
        }
    });
}

// 3. OVERALL CASH FLOW (MONTHLY BAR CHART)
function renderCashFlowChart() {
    const canvas = document.getElementById("cashFlowChart");
    const emptyState = document.getElementById("cashFlowChartEmpty");
    if (!canvas) return;

    if (allTransactions.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        canvas.style.display = "none";
        if (cashFlowChartInstance) {
            cashFlowChartInstance.destroy();
            cashFlowChartInstance = null;
        }
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    canvas.style.display = "block";

    // Group income and expenses by Month (YYYY-MM)
    const monthMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    allTransactions.forEach(tx => {
        if (!tx.transaction_date) return;
        const d = new Date(tx.transaction_date);
        if (isNaN(d.getTime())) return;

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

        if (!monthMap[key]) {
            monthMap[key] = { label: label, income: 0, expense: 0 };
        }

        const amt = parseFloat(tx.amount || 0);
        if (tx.type === "income") {
            monthMap[key].income += amt;
        } else if (tx.type === "expense") {
            monthMap[key].expense += amt;
        }
    });

    // Sort chronologically and take up to last 6 months
    const sortedKeys = Object.keys(monthMap).sort();
    const recentKeys = sortedKeys.slice(-6);

    const labels = recentKeys.map(k => monthMap[k].label);
    const incomeData = recentKeys.map(k => monthMap[k].income);
    const expenseData = recentKeys.map(k => monthMap[k].expense);

    if (cashFlowChartInstance) {
        cashFlowChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    cashFlowChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "#0284c7", // Light Blue
                    borderRadius: 4,
                    maxBarThickness: 24
                },
                {
                    label: "Expenses",
                    data: expenseData,
                    backgroundColor: "#ec4899", // Pink
                    borderRadius: 4,
                    maxBarThickness: 24
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: { size: 10.5, family: "Plus Jakarta Sans" },
                        color: "#475569"
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = parseFloat(context.raw || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            return ` ${context.dataset.label}: Rs. ${val}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 9.5, family: "Plus Jakarta Sans" },
                        color: "#94a3b8",
                        callback: function(val) {
                            if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
                            if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                            return val;
                        }
                    },
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    ticks: {
                        font: { size: 10.5, weight: "600", family: "Plus Jakarta Sans" },
                        color: "#475569"
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// ============================================================
// BUDGET MANAGEMENT
// ============================================================
async function loadBudgets(monthYear) {
    const monthPicker = document.getElementById("budgetMonthPicker");
    const selectedMonth = monthYear || (monthPicker ? monthPicker.value : '') || new Date().toISOString().slice(0, 7);

    try {
        const response = await fetch(`${BUDGET_API_URL}?month_year=${selectedMonth}`);
        const data = await response.json();

        if (data.success && data.budgets) {
            userBudgets = data.budgets;
            renderBudgetsList(userBudgets);
        }
    } catch (error) {
        console.error("Load budgets error:", error);
    }
}

function renderBudgetsList(budgets) {
    const container = document.getElementById("budgetsList");
    const msg = document.getElementById("budgetMessage");
    if (!container) return;

    container.innerHTML = "";

    if (!budgets || budgets.length === 0) {
        container.innerHTML = '<p class="empty-msg">No budgets set for this month. Set one above to keep spending on track!</p>';
        return;
    }

    if (msg) msg.textContent = "";

    budgets.forEach(b => {
        const limit = parseFloat(b.budget_limit || 0);
        const spent = parseFloat(b.total_spent || 0);
        const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
        const actualPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

        let fillClass = "";
        if (actualPct >= 100) fillClass = "danger";
        else if (actualPct >= 75) fillClass = "warn";

        const card = document.createElement("div");
        card.className = "budget-card";
        card.innerHTML = `
            <div class="budget-top">
                <span class="budget-cat-name">${escapeHtml(b.category_name)}</span>
                <span class="budget-amounts">
                    <strong>Rs. ${spent.toLocaleString("en-IN", {minimumFractionDigits: 2})}</strong> / Rs. ${limit.toLocaleString("en-IN", {minimumFractionDigits: 2})}
                </span>
            </div>
            <div class="budget-progress-track">
                <div class="budget-progress-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
            <div class="budget-bottom">
                <span>${actualPct}% used ${actualPct > 100 ? '<span style="color: var(--danger); font-weight: 700;">(Over Budget!)</span>' : ''}</span>
                <div class="item-btns">
                    <button type="button" class="btn-mini edit-b-btn" title="Edit Budget"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-mini del delete-b-btn" title="Delete Budget"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;

        card.querySelector(".edit-b-btn").addEventListener("click", () => openEditBudgetModal(b));
        card.querySelector(".delete-b-btn").addEventListener("click", () => deleteBudget(b.budget_id));

        container.appendChild(card);
    });
}

async function handleCreateBudget(e) {
    e.preventDefault();

    const categoryId = parseInt(document.getElementById("budgetCategory").value);
    const amount = parseFloat(document.getElementById("budgetAmount").value);
    const monthPicker = document.getElementById("budgetMonthPicker");
    const monthYear = (monthPicker ? monthPicker.value : '') || new Date().toISOString().slice(0, 7);

    if (!categoryId || !amount || amount <= 0) {
        showFeedback("budgetMessage", "Please select a category and enter a valid limit.");
        return;
    }

    try {
        const response = await fetch(BUDGET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: categoryId, amount: amount, month_year: monthYear })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback("budgetMessage", data.message || "Failed to set budget.");
            return;
        }

        document.getElementById("budgetAmount").value = "";
        showFeedback("budgetMessage", "Budget saved successfully!", true);
        await loadBudgets(monthYear);

    } catch (error) {
        console.error("Create budget error:", error);
        showFeedback("budgetMessage", "Error saving budget.");
    }
}

function openEditBudgetModal(b) {
    document.getElementById("editBudgetId").value = b.budget_id;
    document.getElementById("editBudgetMonthYear").value = b.month_year;
    document.getElementById("editBudgetCategory").value = b.category_id;
    document.getElementById("editBudgetAmount").value = b.budget_limit;

    const modal = document.getElementById("editBudgetModal");
    if (modal) modal.style.display = "flex";
}

function closeBudgetModal() {
    const modal = document.getElementById("editBudgetModal");
    if (modal) modal.style.display = "none";
}

async function handleUpdateBudget(e) {
    e.preventDefault();

    const budgetId = parseInt(document.getElementById("editBudgetId").value);
    const monthYear = document.getElementById("editBudgetMonthYear").value;
    const categoryId = parseInt(document.getElementById("editBudgetCategory").value);
    const amount = parseFloat(document.getElementById("editBudgetAmount").value);

    if (!budgetId || !categoryId || !amount || amount <= 0) {
        alert("Please provide valid budget details.");
        return;
    }

    try {
        const response = await fetch(BUDGET_API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budget_id: budgetId, category_id: categoryId, amount: amount, month_year: monthYear })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to update budget.");
            return;
        }

        closeBudgetModal();
        await loadBudgets(monthYear);

    } catch (error) {
        console.error("Update budget error:", error);
        alert("Error updating budget.");
    }
}

async function deleteBudget(budgetId) {
    if (!confirm("Are you sure you want to remove this budget limit?")) {
        return;
    }

    try {
        const response = await fetch(BUDGET_API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budget_id: budgetId })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to delete budget.");
            return;
        }

        const monthPicker = document.getElementById("budgetMonthPicker");
        const monthYear = (monthPicker ? monthPicker.value : '') || new Date().toISOString().slice(0, 7);
        await loadBudgets(monthYear);

    } catch (error) {
        console.error("Delete budget error:", error);
    }
}

// ============================================================
// FINANCIAL GOALS MANAGEMENT
// ============================================================
async function loadGoals() {
    try {
        const response = await fetch(GOAL_API_URL);
        const data = await response.json();

        if (data.success && data.goals) {
            userGoals = data.goals;
            renderGoalsList(userGoals);
        }
    } catch (error) {
        console.error("Load goals error:", error);
    }
}

function renderGoalsList(goals) {
    const container = document.getElementById("goalsList");
    const msg = document.getElementById("goalMessage");
    if (!container) return;

    container.innerHTML = "";

    if (!goals || goals.length === 0) {
        container.innerHTML = '<p class="empty-msg" style="grid-column: 1 / -1;">No financial goals created yet. Set a savings goal above!</p>';
        return;
    }

    if (msg) msg.textContent = "";

    goals.forEach(g => {
        const target = parseFloat(g.target_amount || 0);
        const current = parseFloat(g.current_amount || 0);
        const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const isCompleted = g.status === "completed" || current >= target;

        const card = document.createElement("div");
        card.className = "goal-card";
        card.innerHTML = `
            <div class="goal-header-row">
                <span class="goal-title">${escapeHtml(g.name)}</span>
                <span class="status-badge ${isCompleted ? 'status-completed' : 'status-progress'}">
                    ${isCompleted ? 'Completed' : 'In Progress'}
                </span>
            </div>
            <div class="goal-numbers">
                <span style="color: var(--text-muted);">Saved: <strong style="color: var(--text-primary);">Rs. ${current.toLocaleString("en-IN", {minimumFractionDigits: 2})}</strong></span>
                <span class="goal-target-val">Target: Rs. ${target.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
            </div>
            <div class="budget-progress-track">
                <div class="budget-progress-fill ${isCompleted ? '' : 'warn'}" style="width: ${pct}%; background: ${isCompleted ? 'var(--success)' : 'var(--accent)'};"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted);">
                <span>${pct}% achieved</span>
                <span>Target: ${escapeHtml(g.target_date)}</span>
            </div>
            <div class="goal-actions-row">
                <button type="button" class="btn-primary btn-sm deposit-btn" title="Add Savings">
                    <i class="fa-solid fa-plus"></i> Add Funds
                </button>
                <div class="item-btns">
                    <button type="button" class="btn-mini edit-g-btn" title="Edit Goal"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-mini del delete-g-btn" title="Delete Goal"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;

        card.querySelector(".deposit-btn").addEventListener("click", () => openDepositGoalModal(g));
        card.querySelector(".edit-g-btn").addEventListener("click", () => openEditGoalModal(g));
        card.querySelector(".delete-g-btn").addEventListener("click", () => deleteGoal(g.goal_id));

        container.appendChild(card);
    });
}

async function handleCreateGoal(e) {
    e.preventDefault();

    const name = document.getElementById("goalName").value.trim();
    const targetAmount = parseFloat(document.getElementById("goalTargetAmount").value);
    const initialAmount = parseFloat(document.getElementById("goalInitialAmount").value) || 0;
    const targetDate = document.getElementById("goalTargetDate").value;

    if (!name || !targetAmount || targetAmount <= 0 || !targetDate) {
        showFeedback("goalMessage", "Please fill in all required goal fields.");
        return;
    }

    try {
        const response = await fetch(GOAL_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                target_amount: targetAmount,
                current_amount: initialAmount,
                target_date: targetDate
            })
        });

        const data = await response.json();

        if (!data.success) {
            showFeedback("goalMessage", data.message || "Failed to create goal.");
            return;
        }

        document.getElementById("goalForm").reset();
        showFeedback("goalMessage", "Savings goal created!", true);
        await loadGoals();

    } catch (error) {
        console.error("Create goal error:", error);
        showFeedback("goalMessage", "Error creating goal.");
    }
}

function openDepositGoalModal(g) {
    document.getElementById("depositGoalId").value = g.goal_id;
    document.getElementById("depositGoalNameDisplay").textContent = `Goal: ${g.name}`;
    document.getElementById("depositAmount").value = "";

    const modal = document.getElementById("depositGoalModal");
    if (modal) modal.style.display = "flex";
}

function closeDepositModal() {
    const modal = document.getElementById("depositGoalModal");
    if (modal) modal.style.display = "none";
}

async function handleDepositGoal(e) {
    e.preventDefault();

    const goalId = parseInt(document.getElementById("depositGoalId").value);
    const amount = parseFloat(document.getElementById("depositAmount").value);

    if (!goalId || !amount || amount <= 0) {
        alert("Please enter a valid contribution amount.");
        return;
    }

    try {
        const response = await fetch(GOAL_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deposit", goal_id: goalId, amount: amount })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to add contribution.");
            return;
        }

        closeDepositModal();
        await loadGoals();

    } catch (error) {
        console.error("Deposit goal error:", error);
        alert("Error adding savings.");
    }
}

function openEditGoalModal(g) {
    document.getElementById("editGoalId").value = g.goal_id;
    document.getElementById("editGoalName").value = g.name;
    document.getElementById("editGoalTargetAmount").value = g.target_amount;
    document.getElementById("editGoalCurrentAmount").value = g.current_amount;
    document.getElementById("editGoalTargetDate").value = g.target_date;
    document.getElementById("editGoalStatus").value = g.status || "in_progress";

    const modal = document.getElementById("editGoalModal");
    if (modal) modal.style.display = "flex";
}

function closeGoalModal() {
    const modal = document.getElementById("editGoalModal");
    if (modal) modal.style.display = "none";
}

async function handleUpdateGoal(e) {
    e.preventDefault();

    const goalId = parseInt(document.getElementById("editGoalId").value);
    const name = document.getElementById("editGoalName").value.trim();
    const targetAmount = parseFloat(document.getElementById("editGoalTargetAmount").value);
    const currentAmount = parseFloat(document.getElementById("editGoalCurrentAmount").value);
    const targetDate = document.getElementById("editGoalTargetDate").value;
    const status = document.getElementById("editGoalStatus").value;

    if (!goalId || !name || !targetAmount || targetAmount <= 0 || !targetDate) {
        alert("Please provide valid goal details.");
        return;
    }

    try {
        const response = await fetch(GOAL_API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                goal_id: goalId,
                name: name,
                target_amount: targetAmount,
                current_amount: currentAmount,
                target_date: targetDate,
                status: status
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to update goal.");
            return;
        }

        closeGoalModal();
        await loadGoals();

    } catch (error) {
        console.error("Update goal error:", error);
        alert("Error updating goal.");
    }
}

async function deleteGoal(goalId) {
    if (!confirm("Are you sure you want to delete this financial goal?")) {
        return;
    }

    try {
        const response = await fetch(GOAL_API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goal_id: goalId })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Failed to delete goal.");
            return;
        }

        await loadGoals();

    } catch (error) {
        console.error("Delete goal error:", error);
    }
}

// ============================================================
// MONTHLY FINANCIAL REPORT (PRINT & CSV EXPORTER)
// ============================================================
async function openMonthlyReportModal() {
    const modal = document.getElementById("monthlyReportModal");
    const picker = document.getElementById("reportMonthPicker");

    // Default to current month YYYY-MM
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (picker && !picker.value) {
        picker.value = currentMonth;
    }

    const selectedMonth = picker ? picker.value : currentMonth;

    if (modal) modal.style.display = "flex";
    await loadMonthlyReport(selectedMonth);
}

function closeMonthlyReportModal() {
    const modal = document.getElementById("monthlyReportModal");
    if (modal) modal.style.display = "none";
}

async function loadMonthlyReport(monthYear) {
    if (!monthYear) {
        monthYear = new Date().toISOString().slice(0, 7);
    }

    try {
        const response = await fetch(`${REPORT_API_URL}?month_year=${monthYear}`);
        const data = await response.json();

        if (data.success && data.report) {
            currentMonthlyReport = data.report;
            renderMonthlyReport(currentMonthlyReport);
        } else {
            console.error("Failed to load report:", data.message);
        }
    } catch (error) {
        console.error("Report fetch error:", error);
    }
}

function renderMonthlyReport(report) {
    if (!report) return;

    // 1. Period & Meta
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [year, monthNum] = report.month_year.split("-");
    const monthName = monthNames[parseInt(monthNum, 10) - 1] || report.month_year;

    const rptPeriodText = document.getElementById("rptPeriodText");
    const rptGeneratedText = document.getElementById("rptGeneratedText");
    const rptAccountHolder = document.getElementById("rptAccountHolder");

    if (rptPeriodText) rptPeriodText.textContent = `${monthName} ${year}`;
    if (rptGeneratedText) rptGeneratedText.textContent = report.generated_at || new Date().toLocaleString();
    if (rptAccountHolder) rptAccountHolder.textContent = report.user?.name || "Account Holder";

    // 2. Executive Summary Metrics
    const sum = report.summary || {};
    const totalInc = parseFloat(sum.total_income || 0);
    const totalExp = parseFloat(sum.total_expenses || 0);
    const netSav = parseFloat(sum.net_savings || 0);
    const savRate = parseFloat(sum.savings_rate || 0);

    const rptTotalIncome = document.getElementById("rptTotalIncome");
    const rptTotalExpenses = document.getElementById("rptTotalExpenses");
    const rptNetSavings = document.getElementById("rptNetSavings");
    const rptSavingsRate = document.getElementById("rptSavingsRate");

    if (rptTotalIncome) rptTotalIncome.textContent = `Rs. ${totalInc.toLocaleString("en-IN", {minimumFractionDigits: 2})}`;
    if (rptTotalExpenses) rptTotalExpenses.textContent = `Rs. ${totalExp.toLocaleString("en-IN", {minimumFractionDigits: 2})}`;
    if (rptNetSavings) {
        rptNetSavings.textContent = `Rs. ${netSav.toLocaleString("en-IN", {minimumFractionDigits: 2})}`;
        rptNetSavings.style.color = netSav >= 0 ? "#1e40af" : "#be185d";
    }
    if (rptSavingsRate) {
        rptSavingsRate.textContent = `${savRate}%`;
        rptSavingsRate.style.color = savRate >= 0 ? "#15803d" : "#be185d";
    }

    // 3. Category Expenses Breakdown Table
    const catExpBody = document.getElementById("rptExpenseCategoryBody");
    if (catExpBody) {
        catExpBody.innerHTML = "";
        const expCategories = report.expense_categories || [];

        if (expCategories.length === 0) {
            catExpBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); font-style: italic;">No expenses recorded this month.</td></tr>';
        } else {
            expCategories.forEach(cat => {
                const tr = document.createElement("tr");
                const emoji = getCategoryEmoji(cat.category_name);
                tr.innerHTML = `
                    <td>${emoji} <strong>${escapeHtml(cat.category_name)}</strong></td>
                    <td style="text-align: right; font-weight: 700; color: #be185d;">Rs. ${parseFloat(cat.total_amount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right;"><span class="rpt-pct-badge">${cat.percentage}%</span></td>
                `;
                catExpBody.appendChild(tr);
            });
        }
    }

    // 4. Budget Adherence Table
    const budgetBody = document.getElementById("rptBudgetBody");
    if (budgetBody) {
        budgetBody.innerHTML = "";
        const budgets = report.budget_adherence || [];

        if (budgets.length === 0) {
            budgetBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); font-style: italic;">No budgets configured for this month.</td></tr>';
        } else {
            budgets.forEach(b => {
                const tr = document.createElement("tr");
                const isOver = b.status === "over_budget";
                tr.innerHTML = `
                    <td><strong>${escapeHtml(b.category_name)}</strong></td>
                    <td style="text-align: right;">Rs. ${parseFloat(b.budget_limit).toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: 700; color: ${isOver ? '#be185d' : '#1e40af'};">Rs. ${parseFloat(b.total_spent).toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
                    <td style="text-align: center;">
                        <span class="status-badge ${isOver ? 'rpt-badge-over' : 'status-completed'}">
                            ${isOver ? 'Over Budget' : 'Within Limit'} (${b.percentage_used}%)
                        </span>
                    </td>
                `;
                budgetBody.appendChild(tr);
            });
        }
    }

    // 5. Itemized Transactions Ledger
    const txBody = document.getElementById("rptTransactionsBody");
    if (txBody) {
        txBody.innerHTML = "";
        const transactions = report.transactions || [];

        if (transactions.length === 0) {
            txBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); font-style: italic;">No transactions recorded this month.</td></tr>';
        } else {
            transactions.forEach(t => {
                const tr = document.createElement("tr");
                const isInc = t.type === "income";
                tr.innerHTML = `
                    <td>${escapeHtml(t.transaction_date)}</td>
                    <td>${escapeHtml(t.description || '-')}</td>
                    <td>${escapeHtml(t.category_name || 'Uncategorized')}</td>
                    <td>
                        <span class="type-pill ${isInc ? 'pill-income' : 'pill-expense'}">
                            ${isInc ? 'Income' : 'Expense'}
                        </span>
                    </td>
                    <td style="text-align: right; font-weight: 700; color: ${isInc ? '#1d4ed8' : '#be185d'};">
                        ${isInc ? '+' : '-'} Rs. ${parseFloat(t.amount).toLocaleString("en-IN", {minimumFractionDigits: 2})}
                    </td>
                `;
                txBody.appendChild(tr);
            });
        }
    }
}

function printMonthlyReport() {
    window.print();
}

function downloadMonthlyReportCSV() {
    if (!currentMonthlyReport) {
        alert("No report data loaded to export.");
        return;
    }

    const r = currentMonthlyReport;
    const sum = r.summary || {};

    let csvContent = "";

    // 1. Title & Executive Summary
    csvContent += `PERSONAL FINANCE TRACKER - MONTHLY STATEMENT\n`;
    csvContent += `Statement Period,${r.month_year}\n`;
    csvContent += `Generated On,${r.generated_at}\n`;
    csvContent += `Account Holder,"${r.user?.name || 'User'}"\n\n`;

    csvContent += `EXECUTIVE SUMMARY\n`;
    csvContent += `Total Income (Rs.),${sum.total_income}\n`;
    csvContent += `Total Expenses (Rs.),${sum.total_expenses}\n`;
    csvContent += `Net Savings (Rs.),${sum.net_savings}\n`;
    csvContent += `Savings Rate (%),${sum.savings_rate}%\n`;
    csvContent += `Total Transactions,${sum.transaction_count}\n\n`;

    // 2. Category Expenses Breakdown
    csvContent += `EXPENSE BREAKDOWN BY CATEGORY\n`;
    csvContent += `Category,Amount (Rs.),Percentage (%)\n`;
    (r.expense_categories || []).forEach(cat => {
        csvContent += `"${cat.category_name}",${cat.total_amount},${cat.percentage}%\n`;
    });
    csvContent += `\n`;

    // 3. Budget Performance
    csvContent += `BUDGET PERFORMANCE\n`;
    csvContent += `Category,Budget Limit (Rs.),Total Spent (Rs.),Usage (%),Status\n`;
    (r.budget_adherence || []).forEach(b => {
        csvContent += `"${b.category_name}",${b.budget_limit},${b.total_spent},${b.percentage_used}%,${b.status}\n`;
    });
    csvContent += `\n`;

    // 4. Itemized Ledger
    csvContent += `ITEMIZED TRANSACTIONS\n`;
    csvContent += `Date,Description,Category,Type,Amount (Rs.)\n`;
    (r.transactions || []).forEach(t => {
        const desc = (t.description || '').replace(/"/g, '""');
        const cat = (t.category_name || '').replace(/"/g, '""');
        csvContent += `"${t.transaction_date}","${desc}","${cat}","${t.type}",${t.amount}\n`;
    });

    // Create Download Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Financial_Report_${r.month_year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================
// UTILITY
// ============================================================
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}