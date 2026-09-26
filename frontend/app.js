const API_URL = "/api/transactions";

async function loadTransactions() {
    const table = document.getElementById("transactionTable");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const transactions = await response.json();

        if (!Array.isArray(transactions) || transactions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No transactions found
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = transactions.slice(0, 5).map(transaction => {
            const amount = Number(transaction.amount || 0);
            const type = transaction.type || "expense";

            const isIncome = type.toLowerCase() === "income";

            return `
                <tr>
                    <td>
                        <div class="transaction-name">
                            <div class="transaction-icon">
                                ${isIncome ? "₹" : "💳"}
                            </div>

                            <div>
                                <strong>
                                    ${escapeHtml(transaction.description || "Transaction")}
                                </strong>

                                <small>
                                    ${escapeHtml(transaction.category || "Other")}
                                </small>
                            </div>
                        </div>
                    </td>

                    <td>
                        ${escapeHtml(transaction.category || "Other")}
                    </td>

                    <td>
                        ${formatDate(transaction.date)}
                    </td>

                    <td>
                        <span class="badge completed">
                            Completed
                        </span>
                    </td>

                    <td class="amount ${isIncome ? "income" : "expense"}">
                        ${isIncome ? "+" : "−"} ₹${amount.toLocaleString("en-IN")}
                    </td>
                </tr>
            `;
        }).join("");

        updateTransactionCount(transactions);

    } catch (error) {
        console.error("Unable to load transactions:", error);

        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Unable to load transactions
                </td>
            </tr>
        `;
    }
}


function updateTransactionCount(transactions) {
    const countElement = document.getElementById("transactionCount");

    if (countElement) {
        countElement.textContent = transactions.length;
    }
}


function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


document.addEventListener("DOMContentLoaded", () => {
    loadTransactions();
});
