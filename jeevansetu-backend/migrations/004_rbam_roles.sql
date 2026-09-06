-- RBAMS role update
-- Adds Receptionist to the supported user roles.

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (
    role IN (
        'patient',
        'doctor',
        'receptionist',
        'admin',
        'super_admin'
    )
);