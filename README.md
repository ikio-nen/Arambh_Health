Arambh Health

Emergency-to-care platform. A monorepo holding three apps described in the
**Unified Build Guide v4** and the **Frontend Walkthrough**:

| App | Stack | What it is | Port |
|-----|-------|-----------|------|
| `jeevansetu-backend` | Node.js + Express + PostgreSQL | JSON API owned by Dev 1–4 (auth, patients/hospitals/emergency, consultations/follow-ups/timeline, audit logs) | `4000` |
| `jeevansetu-ai-service` | Python + FastAPI + spaCy | Triage/symptom extraction (`POST /extract-case-data`) — zero backend dependencies | `8001` |
| `jeevansetu-frontend` | Static HTML/CSS/JS | No build step — open with the VS Code Live Server extension | `5500` (Live Server) |

> All code files are intentionally empty. Fill each one in using the matching
> snippets in the two PDFs, then commit and push.

## Repo layout

```
jeevansetu/
+-- jeevansetu-backend/
|   +-- migrations/                 001_init.sql · 002_consultations.sql · 003_audit_logs.sql
|   +-- src/
|       +-- index.js, app.js        boots the server, mounts every route
|       +-- config/                 db.js, migrate.js
|       +-- middleware/             verifyToken.js (Dev 1), requireRole.js (Dev 1, imported by everyone)
|       +-- routes/                 auth (Dev1) · hospitals/patients/emergency (Dev2)
|       |                           consultations/followups/timeline (Dev3) · audit (Dev4)
|       +-- utils/                  jwt.js, hash.js (Dev1) · geo.js (Dev2)
|                                   auditLog.js, aiClient.js (Dev4)
+-- jeevansetu-ai-service/
|   +-- app/main.py                 FastAPI entrypoint
|   +-- app/routes/extract.py       POST /extract-case-data
|   +-- app/nlp/extractor.py        spaCy / rule-based extraction
|   +-- app/models/schemas.py       request/response models
+-- jeevansetu-frontend/
    +-- index.html, login.html, signup.html, emergency.html, dashboard.html
    +-- consultation.html, timeline.html, manage-staff.html, audit-log.html
    +-- assets/css/styles.css
    +-- assets/js/  api.js · auth.js · dashboard.js · emergency.js
                    consultation.js · timeline.js · admin.js · audit.js
```

Notes
- `src/utils/aiClient.js` is a suggested shared home for `callAiExtract()`
  (called by Dev 2's `emergency.js` and Dev 3's `consultations.js`). It is not
  named explicitly in the guide — rename/move it as your team prefers.
- Never edit a migration that has already run — new tables get a new file.
- Backend branches (guide): `dev1-auth`, `dev2-patients`,
  `dev3-consultations`, `dev4-audit`. Merge into `main` the same day.

## Run order (local)

1. `jeevansetu-backend` — `npm install && npm run dev` → `http://localhost:4000`
   (run `node src/config/migrate.js` after creating the DB)
2. `jeevansetu-ai-service` — `pip install -r requirements.txt`, download the
   spaCy model, then `uvicorn app.main:app --reload --port 8001`
3. `jeevansetu-frontend` — open `index.html` with Live Server; make sure
   `API_BASE` in `assets/js/api.js` points at the backend port

## Endpoint map (what the frontend calls)

| Method | Endpoint | Owner | Auth |
|--------|----------|-------|------|
| POST | `/auth/signup`, `/auth/login` | Dev 1 | Open |
| GET | `/auth/verify` | Dev 1 | Token |
| GET/PATCH | `/users`, `/users/:id/role` | Dev 1 | Admin |
| POST | `/emergency/intake` | Dev 2 | Open (no login) |
| GET | `/emergency/queue?hospital_id=` | Dev 2 | Staff |
| PUT | `/patients/:id/convert` | Dev 2 | Staff |
| GET | `/hospitals/:id/staff` | Dev 2 | Admin |
| POST/GET/PATCH | `/consultations` | Dev 3 | Staff |
| POST/GET | `/followups` | Dev 3 | Staff |
| GET | `/timeline/:patientId` | Dev 3 | Staff |
| POST | `/extract-case-data` | Dev 4 (AI) | Internal |
| GET | `/audit-logs` | Dev 4 | Admin |

DB tables (7): `hospitals`, `users`, `patient_profiles`, `emergency_cases`
(001) · `consultations`, `followups` (002) · `audit_logs` (003).
