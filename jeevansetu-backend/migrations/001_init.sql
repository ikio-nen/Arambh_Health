-- 001_init.sql
-- Dev 1 (users) + Dev 2 (hospitals, patient_profiles, emergency_cases)
-- Run order: first migration — creates the foundational tables

-- ============================================================
-- hospitals — root of the whole scoping model (Dev 2)
-- ============================================================
CREATE TABLE hospitals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    address             TEXT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    emergency_capacity  INT DEFAULT 0
);

-- ============================================================
-- users — one shared credential table for every role (Dev 1)
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            TEXT NOT NULL CHECK (role IN ('patient','doctor','admin','super_admin')),
    hospital_id     UUID REFERENCES hospitals(id),   -- null only for super_admin
    email           TEXT UNIQUE NOT NULL,
    phone           TEXT,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT now()
);

-- ============================================================
-- patient_profiles — shell records live here until converted (Dev 2)
-- ============================================================
CREATE TABLE patient_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),           -- null for emergency shells
    patient_code        TEXT UNIQUE NOT NULL,
    is_emergency_shell  BOOLEAN DEFAULT false,
    age                 INT,
    gender              TEXT,
    phone               TEXT
);

-- ============================================================
-- emergency_cases — one row per Emergency intake (Dev 2)
-- ============================================================
CREATE TABLE emergency_cases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_profile_id  UUID REFERENCES patient_profiles(id),
    hospital_id         UUID REFERENCES hospitals(id),
    location            TEXT,
    condition_text      TEXT,
    triage_tag          TEXT,
    status              TEXT DEFAULT 'pending',
    created_at          TIMESTAMP DEFAULT now()
);
