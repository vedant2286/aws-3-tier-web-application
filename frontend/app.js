const statusElement = document.getElementById("status");

async function checkApplication() {
    try {
        const response = await fetch("/api/health");

        if (!response.ok) {
            throw new Error("Application unavailable");
        }

        const data = await response.json();

        statusElement.textContent =
            "Application is online ✓ " + data.message;

    } catch (error) {
        statusElement.textContent =
            "Application is waiting for the backend...";
    }
}

async function loadTransactions() {
    const list = document.getElementById("transaction-list");

    list.innerHTML = "<p>Loading transactions...</p>";

    try {
        const response = await fetch("/api/transactions");

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const transactions = await response.json();

        if (transactions.length === 0) {
            list.innerHTML = "<p>No transactions found.</p>";
            return;
        }

        list.innerHTML = "";

        transactions.forEach(transaction => {

            const item = document.createElement("div");

            item.className = "transaction";

            item.innerHTML = `
                <strong>${transaction.description}</strong>
                <span>
                    ₹${transaction.amount} • ${transaction.category}
                </span>
            `;

            list.appendChild(item);
        });

    } catch (error) {

        list.innerHTML =
            "<p>Backend is not connected yet. We will configure it next.</p>";
    }
}

checkApplication();
