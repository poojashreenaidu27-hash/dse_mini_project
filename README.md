# CampusFix

CampusFix is a full-stack, data-driven campus infrastructure complaint management and predictive maintenance analytics system. It enables anonymous and identified complaint reporting, real-time lifecycle tracking with cryptographic secret tokens, machine learning resolution duration forecasting, and an administrator facilities management dashboard.

---

## Architecture Overview

- **Backend**: FastAPI (Python 3.11+), SQLite ORM via SQLAlchemy, JWT session authentication, ML inference pipeline.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router, Recharts.
- **Machine Learning**: Scikit-Learn regression model predicting repair durations based on facility location, maintenance category, urgency severity, and temporal benchmarks.

---

## Prerequisites

- **Python 3.11+** (Check via `python3 --version`)
- **Node.js 18+** and **npm** (Check via `node -v` and `npm -v`)

---

## How to Run the Project

### 1. Backend Setup

From the repository root (`/Users/nameadd/dse_mini_project`):

```bash
# 1. Create Python virtual environment (if not already created)
python3 -m venv backend/.venv

# 2. Activate virtual environment
source backend/.venv/bin/activate       # macOS / Linux
# .\backend\.venv\Scripts\activate      # Windows PowerShell

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Provision demo accounts & seed historical training data (already done)
python backend/scripts/create_demo_accounts.py
python backend/scripts/seed_synthetic_data.py

# 5. Start the FastAPI backend server (from repository root)
uvicorn backend.app.main:app --reload --port 8000
```

- **Backend Health Check**: <http://127.0.0.1:8000/api/v1/health>
- **Interactive Swagger API Docs**: <http://127.0.0.1:8000/api/docs>

---

### 2. Frontend Setup

In a **new terminal window**, navigate to the `frontend` directory:

```bash
# 1. Go to frontend directory
cd frontend

# 2. Install Node dependencies (if not already installed)
npm install

# 3. Start Vite development server
npm run dev
```

- **Web Application URL**: <http://localhost:5173>
*(Vite proxies all `/api/*` calls automatically to the backend on port 8000).*

---

## Pre-seeded Demo Accounts

For grading, evaluation, or testing, the login page features **1-click instant demo fill buttons**, or you can enter these credentials manually:

| Role | Email | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusfix.local` | `AdminCampusFix2026!` | Admin Dashboard, work order review, lifecycle status transitions, audit remarks |
| **Data Analyst** | `analyst@campusfix.local` | `AnalystCampusFix2026!` | Campus Analytics, incident trends by facility & category, resolution KPIs |
| **Student** | `student@campusfix.local` | `StudentCampusFix2026!` | Identified complaint submissions tied to student profile |

> **Note:** Anonymous reporting requires **no account**. You can immediately submit issues from `/complaint` and receive a secret tracking token.

---

## Key Features

1. **Anonymous & Identified Reporting**:
   - Students can file reports without revealing identity.
   - Generates a unique Complaint ID (`CFX-2026-XXXXX`) and a secret cryptographic tracking token (`cfx_sec_...`).

2. **Predictive Resolution Estimator**:
   - Machine learning model predicts expected resolution hours at the moment of submission using historical maintenance benchmarks.

3. **Live Lifecycle Tracker**:
   - Step progress visualization (`Submitted` → `Acknowledged` → `In Progress` → `Resolved`).
   - Chronological audit notes and public technician remarks.

4. **Simple & Neat Admin Dashboard**:
   - Key metric cards (Total, Pending, In Progress, Resolved, Urgent Hazards).
   - Real-time search by ID, location, or problem description.
   - Filter by status and severity.
   - Quick one-click status transition dropdowns.

5. **Facilities Analytics**:
   - Volume distribution across campus buildings and laboratories.
   - Highest frequency maintenance categories.
   - Weekly submission vs resolution velocity charts.

---

## Running the Automated Test Suite

Run the full backend test suite covering authentication, anonymous tracking security, complaint lifecycle, and ML predictions:

```bash
backend/.venv/bin/pytest -q
```
*(All 23 backend unit & integration tests should pass).*

To verify the frontend build:

```bash
npm --prefix frontend run build
```

---

## Project Structure

```
dse_mini_project/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Auth, complaints, tracking, admin, analytics, ml
│   │   ├── core/              # Security, JWT tokens, application settings
│   │   ├── db/                # SQLAlchemy session & database initialization
│   │   ├── ml/                # Scikit-learn training & inference pipelines
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── repositories/      # Database CRUD layer
│   │   ├── schemas/           # Pydantic request/response validation
│   │   └── services/          # Business logic & authorization services
│   ├── scripts/               # Account provisioning & synthetic data seeds
│   └── tests/                 # 23 automated pytest suites
├── data/                      # Synthetic complaint CSV dataset
├── models/                    # Trained resolution estimator joblib & metadata
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, Header, Input, Button, Badge, Notification
│   │   ├── context/           # AuthContext & NotificationContext
│   │   ├── lib/               # Typed API fetch client with credentials support
│   │   ├── pages/             # Home, Submit, Track, AdminDashboard, Analytics, Auth
│   │   ├── types/             # TypeScript schema interfaces
│   │   ├── App.tsx            # Routes & route protection
│   │   └── main.tsx           # React entry point
│   ├── package.json
│   └── vite.config.ts
├── campusfix.db               # SQLite database
├── requirements.txt           # Unified Python requirements
└── README.md                  # Unified documentation
```

---

## License

MIT © 2026 CampusFix Team
