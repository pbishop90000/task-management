CREATE DATABASE IF NOT EXISTS websim_users;
USE websim_users;

-- Users table for registration & login
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Store hashed passwords
    is_protected BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    issue_type ENUM('password_reset', 'account_reactivation', 'other') NOT NULL,
    issue_details TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Support Ticket Responses table
CREATE TABLE IF NOT EXISTS support_ticket_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    admin_username VARCHAR(50) NOT NULL,
    response_text TEXT NOT NULL,
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_username) REFERENCES users(username) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    task_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Homework table
CREATE TABLE IF NOT EXISTS homework (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(100),
    due_date DATE,
    description TEXT,
    priority ENUM('low', 'medium', 'high'),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    instructor VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_username VARCHAR(50) NOT NULL,
    recipient_username VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (recipient_username) REFERENCES users(username) ON DELETE CASCADE
);

-- Insert default admin and support users
INSERT INTO users (username, full_name, password_hash, is_protected, is_admin) VALUES 
('admin', 'System Administrator', '$2b$10$yourHashedPasswordHere', TRUE, TRUE),
('support', 'Technical Support', '$2b$10$anotherHashedPasswordHere', TRUE, TRUE)
ON DUPLICATE KEY UPDATE id = id;