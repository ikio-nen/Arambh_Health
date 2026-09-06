-- Patient registration workflow
-- pending = awaiting verification
-- approved = account can access the system
-- rejected = registration was rejected

ALTER TABLE users
ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_registration_status_check;

ALTER TABLE users
ADD CONSTRAINT users_registration_status_check
CHECK (
    registration_status IN (
        'pending',
        'approved',
        'rejected'
    )
);