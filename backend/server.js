const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "cloudledger",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


/* =========================
   HEALTH CHECK
========================= */

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "healthy",
            service: "CloudLedger API",
            database: "connected"
        });
    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            service: "CloudLedger API",
            database: "disconnected"
        });
    }
});


/* =========================
   TRANSACTIONS
========================= */

app.get("/api/transactions", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                t.id,
                t.description,
                t.amount,
                t.transaction_type AS type,
                t.transaction_date AS date,
                t.notes,
                c.name AS category
            FROM transactions t
            LEFT JOIN categories c
                ON t.category_id = c.id
            ORDER BY t.transaction_date DESC, t.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch transactions"
        });
    }
});


app.post("/api/transactions", async (req, res) => {
    try {
        const {
            user_id,
            account_id,
            category_id,
            description,
            amount,
            transaction_type,
            transaction_date,
            notes
        } = req.body;

        if (!description || !amount || !transaction_type || !transaction_date) {
            return res.status(400).json({
                error: "Description, amount, type and date are required"
            });
        }

        const [result] = await pool.query(`
            INSERT INTO transactions
            (
                user_id,
                account_id,
                category_id,
                description,
                amount,
                transaction_type,
                transaction_date,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id || 1,
            account_id || null,
            category_id || null,
            description,
            amount,
            transaction_type,
            transaction_date,
            notes || null
        ]);

        res.status(201).json({
            message: "Transaction created",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create transaction"
        });
    }
});


app.put("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            description,
            amount,
            transaction_type,
            transaction_date,
            category_id,
            notes
        } = req.body;

        const [result] = await pool.query(`
            UPDATE transactions
            SET
                description = ?,
                amount = ?,
                transaction_type = ?,
                transaction_date = ?,
                category_id = ?,
                notes = ?
            WHERE id = ?
        `, [
            description,
            amount,
            transaction_type,
            transaction_date,
            category_id || null,
            notes || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction updated"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update transaction"
        });
    }
});


app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM transactions WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete transaction"
        });
    }
});


/* =========================
   CATEGORIES
========================= */

app.get("/api/categories", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, name, category_type
            FROM categories
            ORDER BY name
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch categories"
        });
    }
});


/* =========================
   BUDGETS
========================= */

app.get("/api/budgets", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                b.id,
                b.name,
                b.amount,
                b.month_year,
                c.name AS category
            FROM budgets b
            LEFT JOIN categories c
                ON b.category_id = c.id
            ORDER BY b.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch budgets"
        });
    }
});


app.post("/api/budgets", async (req, res) => {
    try {
        const {
            user_id,
            category_id,
            name,
            amount,
            month_year
        } = req.body;

        if (!name || !amount || !month_year) {
            return res.status(400).json({
                error: "Name, amount and month are required"
            });
        }

        const [result] = await pool.query(`
            INSERT INTO budgets
            (
                user_id,
                category_id,
                name,
                amount,
                month_year
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            user_id || 1,
            category_id || null,
            name,
            amount,
            month_year
        ]);

        res.status(201).json({
            message: "Budget created",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create budget"
        });
    }
});


/* =========================
   DASHBOARD
========================= */

app.get("/api/dashboard", async (req, res) => {
    try {
        const [summary] = await pool.query(`
            SELECT
                COALESCE(SUM(
                    CASE
                        WHEN transaction_type = 'income'
                        THEN amount
                        ELSE 0
                    END
                ), 0) AS income,

                COALESCE(SUM(
                    CASE
                        WHEN transaction_type = 'expense'
                        THEN amount
                        ELSE 0
                    END
                ), 0) AS expenses,

                COUNT(*) AS transactions

            FROM transactions
        `);

        const income = Number(summary[0].income);
        const expenses = Number(summary[0].expenses);

        res.json({
            income,
            expenses,
            balance: income - expenses,
            transactions: Number(summary[0].transactions)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load dashboard"
        });
    }
});


/* =========================
   ANALYTICS
========================= */

app.get("/api/analytics", async (req, res) => {
    try {
        const [categories] = await pool.query(`
            SELECT
                COALESCE(c.name, 'Other') AS category,
                SUM(t.amount) AS total
            FROM transactions t
            LEFT JOIN categories c
                ON t.category_id = c.id
            WHERE t.transaction_type = 'expense'
            GROUP BY c.name
            ORDER BY total DESC
        `);

        const [monthly] = await pool.query(`
            SELECT
                DATE_FORMAT(transaction_date, '%Y-%m') AS month,
                SUM(
                    CASE
                        WHEN transaction_type = 'expense'
                        THEN amount
                        ELSE 0
                    END
                ) AS expenses,
                SUM(
                    CASE
                        WHEN transaction_type = 'income'
                        THEN amount
                        ELSE 0
                    END
                ) AS income
            FROM transactions
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month
        `);

        res.json({
            categories,
            monthly
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load analytics"
        });
    }
});


/* =========================
   SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`CloudLedger API running on port ${PORT}`);
});
