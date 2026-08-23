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

// App State
let userCategories = [];
let allTransactions = [];
let activeTab = "overview";
let categoryExpenseChartInstance = null;
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
    const userNameDisplay = document.getElementById("userNameDisplay");

    if (authSection) authSection.style.display = "none";
    if (financeSection) financeSection.style.display = "block";
    if (userProfileBar) userProfileBar.style.display = "flex";
    if (appNav) appNav.style.display = "flex";
    if (userNameDisplay) userNameDisplay.textContent = user.name || "User";

    // Set today's date as default
    const dateInput = document.getElementById("transactionDate");
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
}

async function loadAllUserData() {
    await loadCategories();
    await loadTransactions();
    await loadDashboard();
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

    // 4. Category & Transaction Forms
    const categoryForm = document.getElementById("categoryForm");
    if (categoryForm) categoryForm.addEventListener("submit", handleCreateCategoryQuick);

    const categoryFormTab = document.getElementById("categoryFormTab");
    if (categoryFormTab) categoryFormTab.addEventListener("submit", handleCreateCategoryTab);

    const transactionForm = document.getElementById("transactionForm");
    if (transactionForm) transactionForm.addEventListener("submit", handleCreateTransaction);

    // 5. Search & Filter Inputs
    const searchInput = document.getElementById("txSearchInput");
    const typeFilter = document.getElementById("txTypeFilter");
    const catFilter = document.getElementById("txCategoryFilter");

    if (searchInput) searchInput.addEventListener("input", applyTransactionFilters);
    if (typeFilter) typeFilter.addEventListener("change", applyTransactionFilters);
    if (catFilter) catFilter.addEventListener("change", applyTransactionFilters);

    // 6. Modal Handlers
    const closeCatBtn = document.getElementById("closeCategoryModalBtn");
    const cancelCatBtn = document.getElementById("cancelCategoryModalBtn");
    if (closeCatBtn) closeCatBtn.addEventListener("click", closeCategoryModal);
    if (cancelCatBtn) cancelCatBtn.addEventListener("click", closeCategoryModal);

    const editCategoryForm = document.getElementById("editCategoryForm");
    if (editCategoryForm) editCategoryForm.addEventListener("submit", handleUpdateCategory);

    const closeTxBtn = document.getElementById("closeTransactionModalBtn");
    const cancelTxBtn = document.getElementById("cancelTransactionModalBtn");
    if (closeTxBtn) closeTxBtn.addEventListener("click", closeTransactionModal);
    if (cancelTxBtn) cancelTxBtn.addEventListener("click", closeTransactionModal);

    const editTransactionForm = document.getElementById("editTransactionForm");
    if (editTransactionForm) editTransactionForm.addEventListener("submit", handleUpdateTransaction);

    // Close on Escape or Backdrop click
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeCategoryModal();
            closeTransactionModal();
        }
    });

    const catModal = document.getElementById("editCategoryModal");
    if (catModal) {
        catModal.addEventListener("click", (e) => {
            if (e.target === catModal) closeCategoryModal();
        });
    }

    const txModal = document.getElementById("editTransactionModal");
    if (txModal) {
        txModal.addEventListener("click", (e) => {
            if (e.target === txModal) closeTransactionModal();
        });
    }
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
    const tabCategories = document.getElementById("tabCategories");

    if (tabOverview) tabOverview.style.display = tabName === "overview" ? "block" : "none";
    if (tabTransactions) tabTransactions.style.display = tabName === "transactions" ? "block" : "none";
    if (tabCategories) tabCategories.style.display = tabName === "categories" ? "block" : "none";
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

    if (authSection) authSection.style.display = "flex";
    if (loginSection) loginSection.style.display = "block";
    if (registerSection) registerSection.style.display = "none";
    if (financeSection) financeSection.style.display = "none";
    if (userProfileBar) userProfileBar.style.display = "none";
    if (appNav) appNav.style.display = "none";

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

        // 2. Populate Quick Chips (Right Sidebar)
        if (categoryChips) {
            categoryChips.innerHTML = "";
            userCategories.forEach(cat => {
                const chip = document.createElement("span");
                chip.className = "category-chip";
                chip.innerHTML = `
                    <span>${escapeHtml(cat.name)}</span>
                    <button type="button" class="chip-action-btn edit-chip" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="chip-action-btn del-chip" title="Delete"><i class="fa-solid fa-xmark"></i></button>
                `;
                chip.querySelector(".edit-chip").addEventListener("click", () => openCategoryModal(cat.category_id, cat.name));
                chip.querySelector(".del-chip").addEventListener("click", () => deleteCategory(cat.category_id, cat.name));
                categoryChips.appendChild(chip);
            });
        }

        // 3. Populate Category Tab List (Tab 3)
        if (categoryListTab) {
            categoryListTab.innerHTML = "";
            userCategories.forEach(cat => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${escapeHtml(cat.name)}</span>
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

// ============================================================
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

        renderRecentTransactions(allTransactions);
        applyTransactionFilters();
        updateVisualCharts();

    } catch (error) {
        console.error("Transactions loading error:", error);
    }
}

function renderRecentTransactions(transactions) {
    const recentList = document.getElementById("recentTransactionsList");
    const recentMsg = document.getElementById("recentTransactionsMessage");

    if (!recentList) return;
    recentList.innerHTML = "";

    if (!transactions || transactions.length === 0) {
        if (recentMsg) recentMsg.style.display = "block";
        return;
    }

    if (recentMsg) recentMsg.style.display = "none";

    const top5 = [...transactions]
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

function buildTransactionLi(tx) {
    const isIncome = tx.type === "income";
    const amountFormatted = parseFloat(tx.amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const li = document.createElement("li");
    li.innerHTML = `
        <div class="item-left">
            <span class="type-pill ${isIncome ? 'pill-income' : 'pill-expense'}">
                ${isIncome ? 'Income' : 'Expense'}
            </span>
            <div class="item-text">
                <span class="item-heading">${escapeHtml(tx.description || tx.category_name || 'Transaction')}</span>
                <span class="item-subtext">
                    ${escapeHtml(tx.category_name || 'Uncategorized')} &bull; ${escapeHtml(tx.transaction_date)}
                </span>
            </div>
        </div>
        <div class="item-right">
            <span class="item-sum ${isIncome ? 'sum-income' : 'sum-expense'}">
                ${isIncome ? '+' : '-'} Rs. ${amountFormatted}
            </span>
            <div class="item-btns">
                <button type="button" class="btn-mini edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="btn-mini del delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;

    li.querySelector(".edit-btn").addEventListener("click", () => openTransactionModal(tx));
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTransaction(tx.transaction_id));

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
        await loadDashboard();

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
        await loadDashboard();

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
        await loadDashboard();

    } catch (error) {
        console.error("Delete transaction error:", error);
    }
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
    try {
        const response = await fetch(DASHBOARD_API_URL);
        const data = await response.json();

        if (!data.success || !data.summary) return;

        const summary = data.summary;

        const formatCurrency = (val) =>
            "Rs. " + parseFloat(val || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

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
function updateVisualCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js not loaded.");
        return;
    }

    renderCategoryExpenseChart();
    renderCashFlowChart();
}

function renderCategoryExpenseChart() {
    const canvas = document.getElementById("categoryExpenseChart");
    const emptyState = document.getElementById("categoryChartEmpty");
    if (!canvas) return;

    // Filter only expense transactions
    const expenses = allTransactions.filter(t => t.type === "expense");

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

    // Aggregate expenses by category
    const categoryTotals = {};
    expenses.forEach(tx => {
        const cat = tx.category_name || "Uncategorized";
        const amt = parseFloat(tx.amount || 0);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const colors = [
        "#6366f1", "#ec4899", "#f59e0b", "#10b981", 
        "#06b6d4", "#8b5cf6", "#f43f5e", "#14b8a6",
        "#3b82f6", "#e11d48", "#84cc16", "#d946ef"
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
                    position: "right",
                    labels: {
                        boxWidth: 10,
                        font: { size: 11, family: "Plus Jakarta Sans" },
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
                            return ` ${context.label}: Rs. ${val}`;
                        }
                    }
                }
            },
            cutout: "65%"
        }
    });
}

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

    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach(tx => {
        const amt = parseFloat(tx.amount || 0);
        if (tx.type === "income") totalIncome += amt;
        else if (tx.type === "expense") totalExpense += amt;
    });

    if (cashFlowChartInstance) {
        cashFlowChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    cashFlowChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ["#10b981", "#ef4444"],
                borderRadius: 6,
                maxBarThickness: 44
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = parseFloat(context.raw || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            return ` Total: Rs. ${val}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 10, family: "Plus Jakarta Sans" },
                        color: "#94a3b8",
                        callback: function(val) {
                            return "Rs. " + val.toLocaleString("en-IN");
                        }
                    },
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    ticks: {
                        font: { size: 12, weight: "600", family: "Plus Jakarta Sans" },
                        color: "#475569"
                    },
                    grid: { display: false }
                }
            }
        }
    });
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