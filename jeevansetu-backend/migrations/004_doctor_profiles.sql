-- Doctor consultation profiles
-- One profile belongs to exactly one doctor account.

CREATE TABLE doctor_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name           TEXT NOT NULL,
    specialty           TEXT NOT NULL,
    qualification       TEXT,
    registration_number TEXT,
    experience_years    INT CHECK (experience_years IS NULL OR experience_years >= 0),
    bio                 TEXT,
    consultation_fee    NUMERIC(10, 2) CHECK (consultation_fee IS NULL OR consultation_fee >= 0),
    availability        JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX doctor_profiles_specialty_idx ON doctor_profiles (specialty);
