-- Add user_id column to existing tables
ALTER TABLE activities ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE beneficiaries ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE donations ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);

-- Update existing records to associate with admin user (if any)
-- This assumes admin user has id = 1
UPDATE activities SET user_id = 1 WHERE user_id IS NULL;
UPDATE beneficiaries SET user_id = 1 WHERE user_id IS NULL;
UPDATE donations SET user_id = 1 WHERE user_id IS NULL;