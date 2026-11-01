# CampusFix Implementation Checklist & Progress Tracker

CampusFix: An Anonymous Campus Complaint Management and Predictive Maintenance Analytics System
Target: Academic Mini-Project (Second-year CSE - Data Science Essentials)

---

## 1. Phase 1 — Inspect and Plan
- [x] Inspect dev environment (Node.js v24.16.0, Python 3.11.8 via `py`, npm 12.0.2, Git).
- [x] Check git status, branches, and remotes (no commits on main yet, no remotes).
- [x] Preserve `.agent/` and `-agent/` skills library via `.gitignore`.
- [x] Create `.env.example` and local `.env`.
- [x] Create `docs/IMPLEMENTATION_CHECKLIST.md`.
- [ ] Create initial git commit and switch to feature branch `feat/campusfix-full-stack`.

---

## 2. Phase 2 — Backend Architecture & Database
- [ ] Set up Python virtual environment (`venv`) and install backend dependencies.
- [ ] Establish backend structure under `backend/app/`.
- [ ] Implement database models (`User`, `Complaint`, `ComplaintStatusHistory`, `ModelMetadata`).
- [ ] Implement secure password hashing (Argon2 / bcrypt) and token hashing (SHA-256 + constant-time comparison).
- [ ] Build cryptographic tracking token generator (`CFX-` prefix, high entropy) and secure hash storage.
- [ ] Build database repository layer and transaction-safe operations.
- [ ] Create synthetic data generator script (`backend/scripts/seed_synthetic_data.py`) with ~500 realistic records and fixed seed.
- [ ] Implement demo accounts seeding script (`backend/scripts/create_demo_accounts.py`).
- [ ] Implement authentication endpoints (register, login, logout, current user session in HTTP-only cookie).
- [ ] Implement complaint submission endpoints (anonymous and identified).
- [ ] Implement anonymous complaint tracking endpoint (requires complaint_id + secret token).
- [ ] Implement user complaint dashboard endpoints (isolated to user's complaints).
- [ ] Implement admin complaint management endpoints (status update, public remarks, internal notes, lifecycle constraints).
- [ ] Implement backend test suite (`pytest`, `httpx`).

---

## 3. Phase 3 — Machine Learning & Analytics Pipeline
- [ ] Implement regression training pipeline (`backend/app/ml/train.py`):
  - Target: `resolution_hours = (resolved_at - submitted_at)` in hours (non-negative).
  - Train only on valid resolved historical records (`source='synthetic_demo'`).
  - Preprocessing with `ColumnTransformer` (OneHotEncoder for category, location, severity, submission hour/day).
  - Strict leakage prevention: no `resolved_at`, no post-submission features.
  - Candidate models: LinearRegression (baseline), DecisionTreeRegressor, RandomForestRegressor.
  - Evaluation: MAE, RMSE, R² on held-out test set.
  - Save trained pipeline artifact (`models/resolution_estimator.joblib`) and metadata (`models/model_metadata.json`).
- [ ] Implement inference service (`backend/app/ml/predict.py`) with safe fallback if model is uninitialized.
- [ ] Implement database-backed analytics endpoints:
  - KPI counts (total, open, in-progress, resolved, high-severity open, avg resolution hours, live vs synthetic).
  - Breakdown by category, location, severity, volume over time, status.
  - Actual vs predicted resolution comparison for resolved complaints.
  - Recurring-issue detector (category + location clustering in rolling time window).
  - Model performance metadata and evaluation metrics endpoint.

---

## 4. Phase 4 — Frontend Foundation & Design System
- [ ] Initialize Vite + React + TypeScript in `frontend/`.
- [ ] Install Tailwind CSS, Lucide React, Recharts, React Router, React Hook Form, Zod.
- [ ] Configure design tokens: warm off-white background, deep ink text, muted cobalt primary, clear status/severity semantic colors.
- [ ] Build reusable UI primitives: button, input, select, textarea, card, badge, table, modal/dialog, notification/toast, tabs.
- [ ] Build navigation and layout with role-aware headers and mobile drawer.
- [ ] Implement auth context provider with persistent session sync and role checks.

---

## 5. Phase 5 — Pages & End-to-End Workflows
- [ ] Public Landing Page (`/`):
  - Brand hero with clear purpose and non-official disclaimer.
  - Action buttons: "Report an Issue", "Track a Complaint".
  - Transparent explanation of anonymous reporting and token-based tracking.
- [ ] Anonymous / Identified Report Page (`/report`):
  - Category, Location, Severity, Description, submission mode toggle.
  - Client & server validation with clear error feedback.
  - One-time confirmation view with Complaint ID, Secret Token, copy button, print button, and critical storage warning.
- [ ] Public Track Page (`/track`):
  - Complaint ID + Secret Token form.
  - Verified public status timeline, public remarks, resolution time estimates.
  - No internal notes or identity leakage.
- [ ] Auth Pages (`/login`, `/register`).
- [ ] User Dashboard (`/dashboard`) & Details (`/dashboard/complaints/:id`):
  - My complaints summary, filterable table, complaint detail with live status timeline.
- [ ] Admin Overview (`/admin`):
  - Live KPIs, source split (live vs synthetic), quick shortcuts.
- [ ] Admin Complaint Management (`/admin/complaints` & `/admin/complaints/:id`):
  - Filter by category, location, severity, status, source.
  - Detail view with status transition controls, public remarks, private internal notes, audit history.
- [ ] Analytics & Recurring Issues (`/admin/analytics` and `/analyst`):
  - Filterable Recharts dashboards, recurring issue clusters with recommended actions, ML model diagnostics.

---

## 6. Phase 6 — Quality Assurance, Testing & Hardening
- [ ] Execute backend test suite with `pytest`.
- [ ] Execute frontend TypeScript type check (`tsc --noEmit`).
- [ ] Execute frontend production build (`npm run build`).
- [ ] Verify complete demo workflow end-to-end (submit anonymous, track, admin update, user verify, analytics update).
- [ ] Confirm no secrets, tokens, or plaintext passwords in database or API responses.

---

## 7. Phase 7 — Documentation & Source Control
- [ ] Comprehensive `README.md` with Windows PowerShell commands.
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/DATABASE_SCHEMA.md`
- [ ] `docs/ML_METHODOLOGY.md`
- [ ] `docs/SECURITY_AND_PRIVACY.md`
- [ ] `docs/VIVA_PREPARATION.md` (including three-member work breakdown).
- [ ] `data/DATA_DICTIONARY.md`.
- [ ] Review diffs, verify clean working tree, commit in logical milestones.

