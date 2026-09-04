-- 002_consultations.sql
-- Dev 3 — consultations, followups
-- Never edit a migration that has already run — this is a new file

-- ============================================================
-- consultations — doctor-visit records (Dev 3)
-- ============================================================
CREATE TABLE consultations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID REFERENCES patient_profiles(id),
    chief_complaint TEXT,
    history         TEXT,
    symptoms        JSONB,                              -- structured output from Dev 4's AI service
    physical_exam   TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

-- ============================================================
-- followups — feeds GET /timeline/:patientId alongside consultations (Dev 3)
-- ============================================================
CREATE TABLE followups (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID REFERENCES patient_profiles(id),
    consultation_id   UUID REFERENCES consultations(id),
    due_date          DATE,
    notes             TEXT,
    status            TEXT DEFAULT 'open'
);
