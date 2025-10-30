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

-- Settings table (single row for system-wide settings)
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  schoolName VARCHAR(255) NOT NULL,
  schoolLogo VARCHAR(500),
  headerBackground VARCHAR(500),
  aboutContent TEXT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department ENUM('college', 'senior-high') NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (id, username, password, firstName, lastName, role) VALUES
('1', 'admin', '$2a$10$8YKO8qJZDkjTzLXfQYbfqO5XQBOxYpRp1DyuD5L6gEH5kZHZ6kKfC', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default settings
INSERT INTO settings (id, schoolName, aboutContent) VALUES
('1', 'Tayabas Western Academy', 'Access a comprehensive collection of thesis and research papers from our academic community. Explore groundbreaking work across departments and programs.')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default programs
INSERT INTO programs (id, name, department, description, isActive) VALUES
('1', 'Bachelor of Science in Computer Science', 'college', 'Study of computation, algorithms, and information systems', TRUE),
('2', 'Bachelor of Science in Business Administration', 'college', 'Business management and entrepreneurship program', TRUE),
('3', 'Bachelor of Arts in Education', 'college', 'Teacher education and pedagogical studies', TRUE),
('4', 'Science, Technology, Engineering, and Mathematics (STEM)', 'senior-high', 'Focus on science and mathematics disciplines', TRUE),
('5', 'Accountancy, Business, and Management (ABM)', 'senior-high', 'Business and accounting fundamentals', TRUE),
('6', 'Humanities and Social Sciences (HUMSS)', 'senior-high', 'Social sciences and humanities studies', TRUE)
ON DUPLICATE KEY UPDATE id=id;
