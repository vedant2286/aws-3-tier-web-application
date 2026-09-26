USE cloudledger;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_type ENUM('income', 'expense') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_type ENUM('cash', 'bank', 'wallet', 'credit') DEFAULT 'bank',
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    month_year CHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

ALTER TABLE transactions
    ADD COLUMN user_id INT NULL,
    ADD COLUMN account_id INT NULL,
    ADD COLUMN category_id INT NULL,
    ADD COLUMN transaction_type ENUM('income', 'expense')
        NOT NULL DEFAULT 'expense',
    ADD COLUMN transaction_date DATE NULL,
    ADD COLUMN notes TEXT NULL;

INSERT INTO users (name, email)
VALUES ('Vedant Shende', 'vedant@cloudledger.local')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (name, category_type)
VALUES
('Salary', 'income'),
('Freelance', 'income'),
('Food', 'expense'),
('Travel', 'expense'),
('Bills', 'expense'),
('Education', 'expense'),
('Shopping', 'expense'),
('Entertainment', 'expense'),
('Healthcare', 'expense'),
('Other', 'expense')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO accounts (user_id, name, account_type, balance)
SELECT id, 'Primary Bank Account', 'bank', 48520.00
FROM users
WHERE email = 'vedant@cloudledger.local'
AND NOT EXISTS (
    SELECT 1 FROM accounts
    WHERE name = 'Primary Bank Account'
);

UPDATE transactions t
JOIN users u
    ON u.email = 'vedant@cloudledger.local'
SET t.user_id = u.id
WHERE t.user_id IS NULL;

UPDATE transactions t
JOIN accounts a
    ON a.name = 'Primary Bank Account'
SET t.account_id = a.id
WHERE t.account_id IS NULL;

UPDATE transactions t
JOIN categories c
    ON LOWER(TRIM(t.category)) = LOWER(TRIM(c.name))
SET t.category_id = c.id
WHERE t.category_id IS NULL;

UPDATE transactions
SET transaction_date = DATE(created_at)
WHERE transaction_date IS NULL;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_id)
    REFERENCES accounts(id)
    ON DELETE SET NULL;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL;

CREATE INDEX idx_transactions_user
ON transactions(user_id);

CREATE INDEX idx_transactions_date
ON transactions(transaction_date);

CREATE INDEX idx_transactions_category
ON transactions(category_id);
