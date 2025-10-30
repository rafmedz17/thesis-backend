-- Create database if not exists
CREATE DATABASE IF NOT EXISTS thesis_archive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE thesis_archive;

-- Users table (for admin and student assistants)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'student-assistant') NOT NULL,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thesis table
CREATE TABLE IF NOT EXISTS thesis (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  abstract LONGTEXT,
  authors JSON,
  advisors JSON,
  department ENUM('college', 'senior-high') NOT NULL,
  program VARCHAR(255),
  year INT,
  pdfUrl VARCHAR(500),
  INDEX idx_department (department),
  INDEX idx_program (program),
  INDEX idx_year (year),
  INDEX idx_title (title(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (id, username, password, firstName, lastName, role) VALUES
('1', 'admin', '$2a$10$8YKO8qJZDkjTzLXfQYbfqO5XQBOxYpRp1DyuD5L6gEH5kZHZ6kKfC', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE username=username;
