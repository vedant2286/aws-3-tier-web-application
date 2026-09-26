USE cloudledger_v2test;

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

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT,
    category_id INT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
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

INSERT INTO users (name, email)
VALUES ('Vedant Shende', 'vedant@cloudledger.local');

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
('Other', 'expense');

INSERT INTO accounts (user_id, name, account_type, balance)
SELECT id, 'Primary Bank Account', 'bank', 48520.00
FROM users
WHERE email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Monthly Salary',
    45000.00,
    'income',
    '2026-09-20',
    'September salary'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Salary'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Grocery Shopping',
    750.00,
    'expense',
    '2026-09-25',
    'Weekly groceries'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Food'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Electricity Bill',
    1200.00,
    'expense',
    '2026-09-24',
    'Monthly electricity bill'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Bills'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Bus and Travel',
    350.00,
    'expense',
    '2026-09-23',
    'Local transportation'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Travel'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Education',
    999.00,
    'expense',
    '2026-09-22',
    'Course materials'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Education'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO transactions
(user_id, account_id, category_id, description, amount,
 transaction_type, transaction_date, notes)
SELECT
    u.id,
    a.id,
    c.id,
    'Mobile Recharge',
    450.00,
    'expense',
    '2026-09-21',
    'Monthly mobile recharge'
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN categories c ON c.name = 'Bills'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO budgets
(user_id, category_id, name, amount, month_year)
SELECT
    u.id,
    c.id,
    'Food Budget',
    5000.00,
    '2026-09'
FROM users u
JOIN categories c ON c.name = 'Food'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO budgets
(user_id, category_id, name, amount, month_year)
SELECT
    u.id,
    c.id,
    'Travel Budget',
    4000.00,
    '2026-09'
FROM users u
JOIN categories c ON c.name = 'Travel'
WHERE u.email = 'vedant@cloudledger.local';

INSERT INTO budgets
(user_id, category_id, name, amount, month_year)
SELECT
    u.id,
    c.id,
    'Entertainment Budget',
    2000.00,
    '2026-09'
FROM users u
JOIN categories c ON c.name = 'Entertainment'
WHERE u.email = 'vedant@cloudledger.local';
