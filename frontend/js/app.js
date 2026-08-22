const LOGIN_API_URL = "../backend/api/login.php";
const LOGOUT_API_URL = "../backend/api/logout.php";

const CATEGORY_API_URL = "../backend/api/categories.php";
const DASHBOARD_API_URL = "../backend/api/dashboard.php";
const TRANSACTION_API_URL = "../backend/api/transactions.php";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // Finance section hidden before login
    document.getElementById("financeSection").style.display = "none";


    // ========================================================
    // LOGIN FORM
    // ========================================================

    document
        .getElementById("loginForm")
        .addEventListener("submit", async (event) => {

            event.preventDefault();

            await login();
        });


    // ========================================================
    // CATEGORY FORM
    // ========================================================

    document
        .getElementById("categoryForm")
        .addEventListener("submit", async (event) => {

            event.preventDefault();

            const name = document
                .getElementById("categoryName")
                .value
                .trim();

            if (!name) {

                showCategoryMessage(
                    "Please enter a category name."
                );

                return;
            }

            await createCategory(name);
        });


    // ========================================================
    // TRANSACTION FORM
    // ========================================================

    document
        .getElementById("transactionForm")
        .addEventListener("submit", async (event) => {

            event.preventDefault();

            await createTransaction();
        });


    // ========================================================
    // LOGOUT BUTTON
    // ========================================================

    document
        .getElementById("logoutButton")
        .addEventListener("click", async () => {

            await logout();

        });

});


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


    // Validation
    if (!email || !password) {

        message.textContent =
            "Email and password are required.";

        return;
    }


    try {

        const response =
            await fetch(LOGIN_API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });


        const data =
            await response.json();


        // Login failed
        if (!data.success) {

            message.textContent =
                data.message ||
                "Login failed.";

            return;
        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        message.textContent =
            "Login successful.";


        // Hide login
        document
            .getElementById("loginSection")
            .style.display = "none";


        // Show finance dashboard
        document
            .getElementById("financeSection")
            .style.display = "block";


        // Clear login form
        document
            .getElementById("loginForm")
            .reset();


        // Load user data
        await loadCategories();

        await loadTransactions();

        await loadDashboard();


    } catch (error) {

        console.error(error);

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
            await fetch(LOGOUT_API_URL, {

                method: "POST"
            });


        const data =
            await response.json();


        if (!data.success) {

            logoutMessage.textContent =
                data.message ||
                "Logout failed.";

            return;
        }


        // Hide finance section
        document
            .getElementById("financeSection")
            .style.display = "none";


        // Show login section
        document
            .getElementById("loginSection")
            .style.display = "block";


        // Clear login fields
        document
            .getElementById("loginForm")
            .reset();


        // Clear messages
        document
            .getElementById("loginMessage")
            .textContent =
            "Logged out successfully.";


        logoutMessage.textContent = "";


        // Clear displayed data
        document
            .getElementById("categoryList")
            .innerHTML = "";

        document
            .getElementById("transactionList")
            .innerHTML = "";


        document
            .getElementById("totalIncome")
            .textContent = "Rs. 0.00";

        document
            .getElementById("totalExpenses")
            .textContent = "Rs. 0.00";

        document
            .getElementById("balance")
            .textContent = "Rs. 0.00";


    } catch (error) {

        console.error(error);

        logoutMessage.textContent =
            "Something went wrong during logout.";
    }
}


// ============================================================
// CATEGORY
// ============================================================

async function loadCategories() {

    const categoryList =
        document.getElementById("categoryList");

    const categorySelect =
        document.getElementById("transactionCategory");


    try {

        const response =
            await fetch(CATEGORY_API_URL);


        const data =
            await response.json();


        categoryList.innerHTML = "";


        categorySelect.innerHTML = `
            <option value="">Select Category</option>
        `;


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to load categories."
            );

            return;
        }


        if (data.categories.length === 0) {

            showCategoryMessage(
                "No categories found."
            );

            return;
        }


        document.getElementById(
            "categoryMessage"
        ).textContent = "";


        data.categories.forEach(category => {

            const li =
                document.createElement("li");


            const nameSpan =
                document.createElement("span");


            nameSpan.textContent =
                category.name;


            // Edit button
            const editButton =
                document.createElement("button");


            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => editCategory(
                    category.category_id,
                    category.name
                )
            );


            // Delete button
            const deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => deleteCategory(
                    category.category_id
                )
            );


            li.appendChild(nameSpan);

            li.appendChild(editButton);

            li.appendChild(deleteButton);


            categoryList.appendChild(li);


            // Dropdown option
            const option =
                document.createElement("option");


            option.value =
                category.category_id;


            option.textContent =
                category.name;


            categorySelect.appendChild(option);

        });


    } catch (error) {

        console.error(error);

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
            await fetch(CATEGORY_API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name
                })
            });


        const data =
            await response.json();


        if (!data.success) {

            showCategoryMessage(
                data.message ||
                "Failed to create category."
            );

            return;
        }


        document.getElementById(
            "categoryName"
        ).value = "";


        showCategoryMessage(
            "Category created successfully."
        );


        await loadCategories();


    } catch (error) {

        console.error(error);

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
            await fetch(CATEGORY_API_URL, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    category_id: categoryId,
                    name: name
                })
            });


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

        console.error(error);

        showCategoryMessage(
            "Something went wrong while updating the category."
        );
    }
}


// ============================================================
// DELETE CATEGORY
// ============================================================

async function deleteCategory(categoryId) {

    if (!confirm(
        "Are you sure you want to delete this category?"
    )) {

        return;
    }


    try {

        const response =
            await fetch(CATEGORY_API_URL, {

                method: "DELETE",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    category_id: categoryId
                })
            });


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

        console.error(error);

        showCategoryMessage(
            "Something went wrong while deleting the category."
        );
    }
}


// ============================================================
// CATEGORY MESSAGE
// ============================================================

function showCategoryMessage(message) {

    document.getElementById(
        "categoryMessage"
    ).textContent = message;
}


// ============================================================
// TRANSACTIONS
// ============================================================

async function loadTransactions() {

    const transactionList =
        document.getElementById("transactionList");


    const transactionMessage =
        document.getElementById("transactionMessage");


    try {

        const response =
            await fetch(TRANSACTION_API_URL);


        const data =
            await response.json();


        transactionList.innerHTML = "";


        if (!data.success) {

            transactionMessage.textContent =
                data.message ||
                "Failed to load transactions.";

            return;
        }


        if (data.transactions.length === 0) {

            transactionMessage.textContent =
                "No transactions found.";

            return;
        }


        transactionMessage.textContent = "";


        data.transactions.forEach(transaction => {

            const li =
                document.createElement("li");


            const details =
                document.createElement("span");


            details.textContent =
                `${transaction.transaction_date} - ` +
                `${transaction.category_name} - ` +
                `${transaction.type} - ` +
                `Rs. ${transaction.amount} - ` +
                `${transaction.description}`;


            // Edit button
            const editButton =
                document.createElement("button");


            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => editTransaction(transaction)
            );


            // Delete button
            const deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => deleteTransaction(
                    transaction.transaction_id
                )
            );


            li.appendChild(details);

            li.appendChild(editButton);

            li.appendChild(deleteButton);


            transactionList.appendChild(li);

        });


    } catch (error) {

        console.error(error);

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
            document.getElementById(
                "transactionAmount"
            ).value
        );


    const type =
        document.getElementById(
            "transactionType"
        ).value;


    const categoryId =
        parseInt(
            document.getElementById(
                "transactionCategory"
            ).value
        );


    const description =
        document.getElementById(
            "transactionDescription"
        ).value
        .trim();


    const transactionDate =
        document.getElementById(
            "transactionDate"
        ).value;


    const message =
        document.getElementById(
            "transactionMessage"
        );


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
            await fetch(TRANSACTION_API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    category_id:
                        categoryId,

                    amount:
                        amount,

                    type:
                        type,

                    description:
                        description,

                    transaction_date:
                        transactionDate
                })
            });


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

        console.error(error);

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
            await fetch(TRANSACTION_API_URL, {

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
            });


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

        console.error(error);

        showTransactionMessage(
            "Something went wrong while updating the transaction."
        );
    }
}


// ============================================================
// DELETE TRANSACTION
// ============================================================

async function deleteTransaction(transactionId) {

    if (!confirm(
        "Are you sure you want to delete this transaction?"
    )) {

        return;
    }


    try {

        const response =
            await fetch(TRANSACTION_API_URL, {

                method: "DELETE",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    transaction_id: transactionId
                })
            });


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

        console.error(error);

        showTransactionMessage(
            "Something went wrong while deleting the transaction."
        );
    }
}


// ============================================================
// TRANSACTION MESSAGE
// ============================================================

function showTransactionMessage(message) {

    document.getElementById(
        "transactionMessage"
    ).textContent = message;
}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {

    const dashboardMessage =
        document.getElementById(
            "dashboardMessage"
        );


    try {

        const response =
            await fetch(DASHBOARD_API_URL);


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


        document.getElementById(
            "totalIncome"
        ).textContent =
            `Rs. ${parseFloat(
                summary.total_income
            ).toFixed(2)}`;


        document.getElementById(
            "totalExpenses"
        ).textContent =
            `Rs. ${parseFloat(
                summary.total_expenses
            ).toFixed(2)}`;


        document.getElementById(
            "balance"
        ).textContent =
            `Rs. ${parseFloat(
                summary.balance
            ).toFixed(2)}`;


        dashboardMessage.textContent = "";


    } catch (error) {

        console.error(error);

        dashboardMessage.textContent =
            "Something went wrong while loading dashboard.";
    }
}