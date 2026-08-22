// ============================================================
// API URLS
// ============================================================

const REGISTER_API_URL = "../backend/api/register.php";
const LOGIN_API_URL = "../backend/api/login.php";
const LOGOUT_API_URL = "../backend/api/logout.php";

const CATEGORY_API_URL = "../backend/api/categories.php";
const DASHBOARD_API_URL = "../backend/api/dashboard.php";
const TRANSACTION_API_URL = "../backend/api/transactions.php";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // Initial Authentication State
    // --------------------------------------------------------

    showLogin();


    // --------------------------------------------------------
    // LOGIN FORM
    // --------------------------------------------------------

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            await login();

        });
    }


    // --------------------------------------------------------
    // REGISTER FORM
    // --------------------------------------------------------

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            await register();

        });
    }


    // --------------------------------------------------------
    // SHOW REGISTER BUTTON
    // --------------------------------------------------------

    const showRegisterButton =
        document.getElementById("showRegisterButton");

    if (showRegisterButton) {

        showRegisterButton.addEventListener("click", () => {

            showRegister();

        });
    }


    // --------------------------------------------------------
    // SHOW LOGIN BUTTON
    // --------------------------------------------------------

    const showLoginButton =
        document.getElementById("showLoginButton");

    if (showLoginButton) {

        showLoginButton.addEventListener("click", () => {

            showLogin();

        });
    }


    // --------------------------------------------------------
    // CATEGORY FORM
    // --------------------------------------------------------

    const categoryForm =
        document.getElementById("categoryForm");

    if (categoryForm) {

        categoryForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const categoryInput =
                document.getElementById("categoryName");

            const name =
                categoryInput.value.trim();


            if (!name) {

                showCategoryMessage(
                    "Please enter a category name."
                );

                return;
            }


            await createCategory(name);

        });
    }


    // --------------------------------------------------------
    // TRANSACTION FORM
    // --------------------------------------------------------

    const transactionForm =
        document.getElementById("transactionForm");

    if (transactionForm) {

        transactionForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            await createTransaction();

        });
    }


    // --------------------------------------------------------
    // LOGOUT BUTTON
    // --------------------------------------------------------

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", async () => {

            await logout();

        });
    }

});


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    const financeSection =
        document.getElementById("financeSection");


    if (loginSection) {

        loginSection.style.display = "block";

    }


    if (registerSection) {

        registerSection.style.display = "none";

    }


    if (financeSection) {

        financeSection.style.display = "none";

    }


    // Clear messages

    const loginMessage =
        document.getElementById("loginMessage");

    if (loginMessage) {

        loginMessage.textContent = "";

    }


    const registerMessage =
        document.getElementById("registerMessage");

    if (registerMessage) {

        registerMessage.textContent = "";

    }
}


// ============================================================
// SHOW REGISTER
// ============================================================

function showRegister() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    const financeSection =
        document.getElementById("financeSection");


    if (loginSection) {

        loginSection.style.display = "none";

    }


    if (registerSection) {

        registerSection.style.display = "block";

    }


    if (financeSection) {

        financeSection.style.display = "none";

    }


    // Clear messages

    const loginMessage =
        document.getElementById("loginMessage");

    if (loginMessage) {

        loginMessage.textContent = "";

    }


    const registerMessage =
        document.getElementById("registerMessage");

    if (registerMessage) {

        registerMessage.textContent = "";

    }
}


// ============================================================
// REGISTER
// ============================================================

async function register() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const confirmPassword =
        document
            .getElementById("registerConfirmPassword")
            .value;


    const message =
        document.getElementById("registerMessage");


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        message.textContent =
            "Please fill in all fields.";

        return;
    }


    if (password.length < 8) {

        message.textContent =
            "Password must be at least 8 characters.";

        return;
    }


    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;
    }


    // --------------------------------------------------------
    // API REQUEST
    // --------------------------------------------------------

    try {

        const response =
            await fetch(
                REGISTER_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Registration Failed
        // ----------------------------------------------------

        if (!data.success) {

            message.textContent =
                data.message ||
                "Registration failed.";

            return;
        }


        // ----------------------------------------------------
        // Registration Successful
        // ----------------------------------------------------

        message.textContent =
            "Registration successful! Please login.";


        // Clear register form

        document
            .getElementById("registerForm")
            .reset();


        // Wait a little so user can see success message

        setTimeout(() => {

            showLogin();

            const loginEmail =
                document.getElementById("loginEmail");

            if (loginEmail) {

                loginEmail.value = email;

            }

        }, 1000);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        message.textContent =
            "Something went wrong during registration.";

    }
}


// ============================================================
// LOGIN
// ============================================================

async function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    const message =
        document.getElementById("loginMessage");


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!email || !password) {

        message.textContent =
            "Email and password are required.";

        return;
    }


    // --------------------------------------------------------
    // API REQUEST
    // --------------------------------------------------------

    try {

        const response =
            await fetch(
                LOGIN_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Login Failed
        // ----------------------------------------------------

        if (!data.success) {

            message.textContent =
                data.message ||
                "Login failed.";

            return;
        }


        // ----------------------------------------------------
        // Login Successful
        // ----------------------------------------------------

        message.textContent =
            "Login successful.";


        // Hide authentication

        document
            .getElementById("authSection")
            .style.display = "none";


        // Show finance application

        document
            .getElementById("financeSection")
            .style.display = "block";


        // Clear login form

        document
            .getElementById("loginForm")
            .reset();


        // ----------------------------------------------------
        // Load User Data
        // ----------------------------------------------------

        await loadCategories();

        await loadTransactions();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        message.textContent =
            "Something went wrong during login.";

    }
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    const logoutMessage =
        document.getElementById("logoutMessage");


    try {

        const response =
            await fetch(
                LOGOUT_API_URL,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Logout Failed
        // ----------------------------------------------------

        if (!data.success) {

            logoutMessage.textContent =
                data.message ||
                "Logout failed.";

            return;
        }


        // ----------------------------------------------------
        // Hide Finance Section
        // ----------------------------------------------------

        document
            .getElementById("financeSection")
            .style.display = "none";


        // ----------------------------------------------------
        // Show Authentication Section
        // ----------------------------------------------------

        document
            .getElementById("authSection")
            .style.display = "block";


        // ----------------------------------------------------
        // Show Login
        // ----------------------------------------------------

        showLogin();


        // ----------------------------------------------------
        // Clear Forms
        // ----------------------------------------------------

        document
            .getElementById("loginForm")
            .reset();


        document
            .getElementById("registerForm")
            .reset();


        // ----------------------------------------------------
        // Clear Categories
        // ----------------------------------------------------

        document
            .getElementById("categoryList")
            .innerHTML = "";


        document
            .getElementById("categoryMessage")
            .textContent =
            "No categories found.";


        // ----------------------------------------------------
        // Clear Transactions
        // ----------------------------------------------------

        document
            .getElementById("transactionList")
            .innerHTML = "";


        document
            .getElementById("transactionMessage")
            .textContent = "";


        // ----------------------------------------------------
        // Reset Dashboard
        // ----------------------------------------------------

        document
            .getElementById("totalIncome")
            .textContent =
            "Rs. 0.00";


        document
            .getElementById("totalExpenses")
            .textContent =
            "Rs. 0.00";


        document
            .getElementById("balance")
            .textContent =
            "Rs. 0.00";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        logoutMessage.textContent =
            "Something went wrong during logout.";

    }
}


// ============================================================
// LOAD CATEGORIES
// ============================================================

async function loadCategories() {

    const categoryList =
        document.getElementById("categoryList");


    const categorySelect =
        document.getElementById("transactionCategory");


    try {

        const response =
            await fetch(
                CATEGORY_API_URL
            );


        const data =
            await response.json();


        categoryList.innerHTML = "";


        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to load categories."
            );

            return;
        }


        if (
            !data.categories ||
            data.categories.length === 0
        ) {

            showCategoryMessage(
                "No categories found."
            );

            return;
        }


        document
            .getElementById("categoryMessage")
            .textContent = "";


        data.categories.forEach((category) => {

            const li =
                document.createElement("li");


            const nameSpan =
                document.createElement("span");


            nameSpan.textContent =
                category.name;


            // ------------------------------------------------
            // EDIT
            // ------------------------------------------------

            const editButton =
                document.createElement("button");


            editButton.textContent =
                "Edit";


            editButton.type =
                "button";


            editButton.addEventListener(
                "click",
                () => {

                    editCategory(
                        category.category_id,
                        category.name
                    );

                }
            );


            // ------------------------------------------------
            // DELETE
            // ------------------------------------------------

            const deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "Delete";


            deleteButton.type =
                "button";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteCategory(
                        category.category_id
                    );

                }
            );


            li.appendChild(nameSpan);

            li.appendChild(editButton);

            li.appendChild(deleteButton);

            categoryList.appendChild(li);


            // ------------------------------------------------
            // CATEGORY DROPDOWN
            // ------------------------------------------------

            const option =
                document.createElement("option");


            option.value =
                category.category_id;


            option.textContent =
                category.name;


            categorySelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Category loading error:",
            error
        );


        showCategoryMessage(
            "Something went wrong while loading categories."
        );

    }
}


// ============================================================
// CREATE CATEGORY
// ============================================================

async function createCategory(name) {

    try {

        const response =
            await fetch(
                CATEGORY_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to create category."
            );

            return;
        }


        document
            .getElementById("categoryName")
            .value = "";


        showCategoryMessage(
            "Category created successfully."
        );


        await loadCategories();


    } catch (error) {

        console.error(
            "Create category error:",
            error
        );


        showCategoryMessage(
            "Something went wrong while creating the category."
        );

    }
}


// ============================================================
// EDIT CATEGORY
// ============================================================

async function editCategory(
    categoryId,
    currentName
) {

    const newName =
        prompt(
            "Enter the new category name:",
            currentName
        );


    if (newName === null) {

        return;

    }


    const name =
        newName.trim();


    if (!name) {

        showCategoryMessage(
            "Category name is required."
        );

        return;
    }


    try {

        const response =
            await fetch(
                CATEGORY_API_URL,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        category_id: categoryId,
                        name: name
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to update category."
            );

            return;
        }


        showCategoryMessage(
            "Category updated successfully."
        );


        await loadCategories();

        await loadTransactions();


    } catch (error) {

        console.error(
            "Edit category error:",
            error
        );


        showCategoryMessage(
            "Something went wrong while updating the category."
        );

    }
}


// ============================================================
// DELETE CATEGORY
// ============================================================

async function deleteCategory(categoryId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this category?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                CATEGORY_API_URL,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        category_id: categoryId
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to delete category."
            );

            return;
        }


        showCategoryMessage(
            "Category deleted successfully."
        );


        await loadCategories();

        await loadTransactions();


    } catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        showCategoryMessage(
            "Something went wrong while deleting the category."
        );

    }
}


// ============================================================
// CATEGORY MESSAGE
// ============================================================

function showCategoryMessage(message) {

    const element =
        document.getElementById("categoryMessage");


    if (element) {

        element.textContent = message;

    }
}


// ============================================================
// LOAD TRANSACTIONS
// ============================================================

async function loadTransactions() {

    const transactionList =
        document.getElementById("transactionList");


    const transactionMessage =
        document.getElementById("transactionMessage");


    try {

        const response =
            await fetch(
                TRANSACTION_API_URL
            );


        const data =
            await response.json();


        transactionList.innerHTML = "";


        if (!data.success) {

            transactionMessage.textContent =
                data.message ||
                "Failed to load transactions.";

            return;
        }


        if (
            !data.transactions ||
            data.transactions.length === 0
        ) {

            transactionMessage.textContent =
                "No transactions found.";

            return;
        }


        transactionMessage.textContent = "";


        data.transactions.forEach((transaction) => {

            const li =
                document.createElement("li");


            const details =
                document.createElement("span");


            details.textContent =
                `${transaction.transaction_date} - ` +
                `${transaction.category_name} - ` +
                `${transaction.type} - ` +
                `Rs. ${transaction.amount} - ` +
                `${transaction.description || ""}`;


            // ------------------------------------------------
            // EDIT
            // ------------------------------------------------

            const editButton =
                document.createElement("button");


            editButton.textContent =
                "Edit";


            editButton.type =
                "button";


            editButton.addEventListener(
                "click",
                () => {

                    editTransaction(transaction);

                }
            );


            // ------------------------------------------------
            // DELETE
            // ------------------------------------------------

            const deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "Delete";


            deleteButton.type =
                "button";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTransaction(
                        transaction.transaction_id
                    );

                }
            );


            li.appendChild(details);

            li.appendChild(editButton);

            li.appendChild(deleteButton);

            transactionList.appendChild(li);

        });


    } catch (error) {

        console.error(
            "Transaction loading error:",
            error
        );


        transactionMessage.textContent =
            "Something went wrong while loading transactions.";

    }
}


// ============================================================
// CREATE TRANSACTION
// ============================================================

async function createTransaction() {

    const amount =
        parseFloat(
            document
                .getElementById("transactionAmount")
                .value
        );


    const type =
        document
            .getElementById("transactionType")
            .value;


    const categoryId =
        parseInt(
            document
                .getElementById("transactionCategory")
                .value
        );


    const description =
        document
            .getElementById("transactionDescription")
            .value
            .trim();


    const transactionDate =
        document
            .getElementById("transactionDate")
            .value;


    const message =
        document.getElementById("transactionMessage");


    if (
        !amount ||
        amount <= 0 ||
        !type ||
        !categoryId ||
        !transactionDate
    ) {

        message.textContent =
            "Please fill in all required fields.";

        return;
    }


    try {

        const response =
            await fetch(
                TRANSACTION_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        category_id: categoryId,

                        amount: amount,

                        type: type,

                        description: description,

                        transaction_date: transactionDate

                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            message.textContent =
                data.message ||
                "Failed to create transaction.";

            return;
        }


        message.textContent =
            "Transaction created successfully.";


        document
            .getElementById("transactionForm")
            .reset();


        await loadTransactions();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Create transaction error:",
            error
        );


        message.textContent =
            "Something went wrong while creating the transaction.";

    }
}


// ============================================================
// EDIT TRANSACTION
// ============================================================

async function editTransaction(transaction) {

    const newAmount =
        prompt(
            "Enter new amount:",
            transaction.amount
        );


    if (newAmount === null) {

        return;

    }


    const amount =
        parseFloat(newAmount);


    if (!amount || amount <= 0) {

        showTransactionMessage(
            "Amount must be greater than zero."
        );

        return;
    }


    const newDescription =
        prompt(
            "Enter new description:",
            transaction.description || ""
        );


    if (newDescription === null) {

        return;

    }


    try {

        const response =
            await fetch(
                TRANSACTION_API_URL,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        transaction_id:
                            transaction.transaction_id,

                        category_id:
                            transaction.category_id,

                        amount:
                            amount,

                        type:
                            transaction.type,

                        description:
                            newDescription.trim(),

                        transaction_date:
                            transaction.transaction_date

                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showTransactionMessage(
                data.message ||
                "Failed to update transaction."
            );

            return;
        }


        showTransactionMessage(
            "Transaction updated successfully."
        );


        await loadTransactions();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Edit transaction error:",
            error
        );


        showTransactionMessage(
            "Something went wrong while updating the transaction."
        );

    }
}


// ============================================================
// DELETE TRANSACTION
// ============================================================

async function deleteTransaction(transactionId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                TRANSACTION_API_URL,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        transaction_id:
                            transactionId
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showTransactionMessage(
                data.message ||
                "Failed to delete transaction."
            );

            return;
        }


        showTransactionMessage(
            "Transaction deleted successfully."
        );


        await loadTransactions();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete transaction error:",
            error
        );


        showTransactionMessage(
            "Something went wrong while deleting the transaction."
        );

    }
}


// ============================================================
// TRANSACTION MESSAGE
// ============================================================

function showTransactionMessage(message) {

    const element =
        document.getElementById("transactionMessage");


    if (element) {

        element.textContent = message;

    }
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    const dashboardMessage =
        document.getElementById("dashboardMessage");


    try {

        const response =
            await fetch(
                DASHBOARD_API_URL
            );


        const data =
            await response.json();


        if (!data.success) {

            dashboardMessage.textContent =
                data.message ||
                "Failed to load dashboard.";

            return;
        }


        const summary =
            data.summary;


        document
            .getElementById("totalIncome")
            .textContent =
            `Rs. ${parseFloat(
                summary.total_income || 0
            ).toFixed(2)}`;


        document
            .getElementById("totalExpenses")
            .textContent =
            `Rs. ${parseFloat(
                summary.total_expenses || 0
            ).toFixed(2)}`;


        document
            .getElementById("balance")
            .textContent =
            `Rs. ${parseFloat(
                summary.balance || 0
            ).toFixed(2)}`;


        dashboardMessage.textContent = "";


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        dashboardMessage.textContent =
            "Something went wrong while loading dashboard.";

    }
}