const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            status: "healthy",
            message: "CloudLedger application is running"
        });

    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            message: "Database connection failed"
        });
    }
});

app.get("/api/transactions", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, amount, description, category, created_at FROM transactions ORDER BY created_at DESC"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to retrieve transactions"
        });
    }
});

app.post("/api/transactions", async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        const [result] = await db.query(
            "INSERT INTO transactions (amount, description, category) VALUES (?, ?, ?)",
            [amount, description, category]
        );

        res.status(201).json({
            message: "Transaction created",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to create transaction"
        });
    }
});

app.listen(PORT, () => {
    console.log(`CloudLedger backend running on port ${PORT}`);
});
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

/* Health check */

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            status: "healthy",
            message: "CloudLedger application is running"
        });

    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            message: "Database connection failed"
        });
    }
});

/* Get transactions */

app.get("/api/transactions", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, amount, description, category, created_at FROM transactions ORDER BY created_at DESC"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to retrieve transactions"
        });
    }
});

/* Add transaction */

app.post("/api/transactions", async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        const [result] = await db.query(
            "INSERT INTO transactions (amount, description, category) VALUES (?, ?, ?)",
            [amount, description, category]
        );

        res.status(201).json({
            message: "Transaction created",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to create transaction"
        });
    }
});

app.listen(PORT, () => {
    console.log(`CloudLedger backend running on port ${PORT}`);
});
