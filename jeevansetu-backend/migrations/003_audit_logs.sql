-- 003_audit_logs.sql
-- Dev 4 — audit_logs
-- Never edit a migration that has already run — this is a new file

-- ============================================================
-- audit_logs — written via one shared helper, called from Dev 2 & Dev 3's routes
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    patient_id  UUID,
    created_at  TIMESTAMP DEFAULT now()
);
