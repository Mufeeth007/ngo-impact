-- Add role column if not exists (already exists in users table)
-- Update existing admin user
UPDATE users SET role = 'admin' WHERE email = 'admin@ngo.com';

-- Add is_active column to users table for enabling/disabling accounts
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Insert sample NGO users (for testing)
INSERT INTO users (username, email, password, role, is_active) VALUES
('Helping Hands NGO', 'helping@ngo.com', '$2a$10$YourHashedPasswordHere', 'ngo', 1),
('Care Foundation', 'care@foundation.com', '$2a$10$YourHashedPasswordHere', 'ngo', 1),
('Education For All', 'education@ngo.org', '$2a$10$YourHashedPasswordHere', 'ngo', 1),
('Health First', 'health@first.com', '$2a$10$YourHashedPasswordHere', 'ngo', 0); -- Disabled account