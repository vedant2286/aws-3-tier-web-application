const API = "/api";

let transactions = [];
let budgets = [];
let analytics = null;


/* =========================
   API HELPERS
========================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API}${endpoint}`, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}


/* =========================
   FORMATTERS
========================= */

function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}


function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    const navItem = document.querySelector(
        `.nav-item[data-section="${sectionId}"]`
    );

    if (navItem) {
        navItem.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });
});


document.querySelectorAll("[data-section-link]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.sectionLink);
    });
});


/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {
    try {
        const dashboard = await apiRequest("/dashboard");

        document.getElementById("balance").textContent =
            money(dashboard.balance);

        document.getElementById("income").textContent =
            money(dashboard.income);

        document.getElementById("expenses").textContent =
            money(dashboard.expenses);

        document.getElementById("transactionCount").textContent =
            dashboard.transactions;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}


/* =========================
   TRANSACTIONS
========================= */

async function loadTransactions() {
    try {
        transactions = await apiRequest("/transactions");

        renderRecentTransactions();
        renderTransactionTable();

    } catch (error) {
        console.error("Transactions error:", error);

        document.getElementById("recentTransactions").innerHTML =
            `<div class="empty-state">
                Unable to load transactions.
            </div>`;
    }
}


function renderRecentTransactions() {
    const container =
        document.getElementById("recentTransactions");

    if (!transactions.length) {
        container.innerHTML =
            `<div class="empty-state">
                No transactions found.
            </div>`;

        return;
    }

    container.innerHTML = transactions
        .slice(0, 6)
        .map(transaction => {

            const income =
                transaction.type === "income";

            return `
                <div class="transaction-item">

                    <div class="transaction-info">

                        <strong>
                            ${escapeHTML(transaction.description)}
                        </strong>

                        <span>
                            ${escapeHTML(transaction.category || "Other")}
                            •
                            ${formatDate(transaction.date)}
                        </span>

                    </div>

                    <div class="transaction-amount
                        ${income
                            ? "amount-income"
                            : "amount-expense"}">

                        ${income ? "+" : "-"}${money(transaction.amount)}

                    </div>

                </div>
            `;
        })
        .join("");
}


function renderTransactionTable() {
    const table =
        document.getElementById("transactionTable");

    if (!transactions.length) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No transactions found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = transactions
        .map(transaction => {

            const income =
                transaction.type === "income";

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(transaction.description)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(transaction.category || "Other")}
                    </td>

                    <td>
                        <span class="type-badge
                            ${income
                                ? "type-income"
                                : "type-expense"}">

                            ${income ? "Income" : "Expense"}

                        </span>
                    </td>

                    <td>
                        ${formatDate(transaction.date)}
                    </td>

                    <td class="${income
                        ? "amount-income"
                        : "amount-expense"}">

                        ${income ? "+" : "-"}${money(transaction.amount)}

                    </td>

                </tr>
            `;
        })
        .join("");
}


/* =========================
   ANALYTICS
========================= */

async function loadAnalytics() {
    try {
        analytics = await apiRequest("/analytics");

        renderCategoryAnalytics();
        renderMonthlyAnalytics();
        renderDashboardCategoryChart();

    } catch (error) {
        console.error("Analytics error:", error);
    }
}


function renderCategoryAnalytics() {
    const container =
        document.getElementById("analyticsCategories");

    if (!analytics || !analytics.categories.length) {
        container.innerHTML =
            `<div class="empty-state">
                No analytics available.
            </div>`;

        return;
    }

    const maximum = Math.max(
        ...analytics.categories.map(item =>
            Number(item.total)
        )
    );

    container.innerHTML = analytics.categories
        .map(item => {

            const total = Number(item.total);

            const percentage =
                maximum > 0
                    ? (total / maximum) * 100
                    : 0;

            return `
                <div class="category-row">

                    <div class="category-label">

                        <span>
                            ${escapeHTML(item.category)}
                        </span>

                        <span>
                            ${money(total)}
                        </span>

                    </div>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>

                    </div>

                </div>
            `;
        })
        .join("");
}


function renderDashboardCategoryChart() {
    const container =
        document.getElementById("categoryChart");

    if (!analytics || !analytics.categories.length) {
        container.innerHTML =
            `<div class="empty-state">
                No spending data.
            </div>`;

        return;
    }

    const maximum = Math.max(
        ...analytics.categories.map(item =>
            Number(item.total)
        )
    );

    container.innerHTML = analytics.categories
        .slice(0, 6)
        .map(item => {

            const total = Number(item.total);

            const percentage =
                maximum > 0
                    ? (total / maximum) * 100
                    : 0;

            return `
                <div class="category-row">

                    <div class="category-label">

                        <span>
                            ${escapeHTML(item.category)}
                        </span>

                        <span>
                            ${money(total)}
                        </span>

                    </div>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>

                    </div>

                </div>
            `;
        })
        .join("");
}


function renderMonthlyAnalytics() {
    const container =
        document.getElementById("monthlyAnalytics");

    if (!analytics || !analytics.monthly.length) {
        container.innerHTML =
            `<div class="empty-state">
                No monthly data.
            </div>`;

        return;
    }

    container.innerHTML = analytics.monthly
        .map(item => `
            <div class="analytics-row">

                <span>
                    ${escapeHTML(item.month)}
                </span>

                <strong>
                    Income ${money(item.income)}
                    <br>
                    Expenses ${money(item.expenses)}
                </strong>

            </div>
        `)
        .join("");
}


/* =========================
   BUDGETS
========================= */

async function loadBudgets() {
    try {
        budgets = await apiRequest("/budgets");

        renderBudgetOverview();
        renderBudgetCards();

    } catch (error) {
        console.error("Budgets error:", error);
    }
}


function getCategorySpent(category) {
    if (!transactions.length) return 0;

    return transactions
        .filter(transaction =>
            transaction.type === "expense" &&
            transaction.category === category
        )
        .reduce(
            (total, transaction) =>
                total + Number(transaction.amount),
            0
        );
}


function renderBudgetOverview() {
    const container =
        document.getElementById("budgetOverview");

    if (!budgets.length) {
        container.innerHTML =
            `<div class="empty-state">
                No budgets configured.
            </div>`;

        return;
    }

    container.innerHTML = budgets
        .map(budget => {

            const spent =
                getCategorySpent(budget.category);

            const limit = Number(budget.amount);

            const percentage =
                limit > 0
                    ? Math.min((spent / limit) * 100, 100)
                    : 0;

            return `
                <div class="budget-item">

                    <strong>
                        ${escapeHTML(budget.name)}
                    </strong>

                    <span>
                        ${money(spent)}
                        spent of
                        ${money(limit)}
                    </span>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>
                    </div>

                </div>
            `;
        })
        .join("");
}


function renderBudgetCards() {
    const container =
        document.getElementById("budgetCards");

    if (!budgets.length) {
        container.innerHTML =
            `<div class="empty-state">
                No budgets available.
            </div>`;

        return;
    }

    container.innerHTML = budgets
        .map(budget => {

            const spent =
                getCategorySpent(budget.category);

            const limit = Number(budget.amount);

            const remaining =
                Math.max(limit - spent, 0);

            const percentage =
                limit > 0
                    ? Math.min((spent / limit) * 100, 100)
                    : 0;

            return `
                <div class="budget-card">

                    <h3>
                        ${escapeHTML(budget.name)}
                    </h3>

                    <span class="muted">
                        ${escapeHTML(budget.category)}
                    </span>

                    <div class="budget-amount">
                        ${money(spent)}
                    </div>

                    <p class="muted">
                        of ${money(limit)} used
                    </p>

                    <br>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>
                    </div>

                    <br>

                    <p class="muted">
                        Remaining:
                        <strong>${money(remaining)}</strong>
                    </p>

                </div>
            `;
        })
        .join("");
}


/* =========================
   REFRESH
========================= */

async function loadApplication() {
    await Promise.all([
        loadDashboard(),
        loadTransactions(),
        loadAnalytics(),
        loadBudgets()
    ]);
}


document
    .getElementById("refreshDashboard")
    .addEventListener("click", loadApplication);


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   START APPLICATION
========================= */

loadApplication();
