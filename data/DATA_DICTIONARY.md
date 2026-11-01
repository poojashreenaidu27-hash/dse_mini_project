# CampusFix Data Dictionary

This document describes the schema and variables used in the CampusFix dataset, synthetic historical records, and persistent SQLite database.

## 1. Data Source Separation
Every complaint in CampusFix carries a mandatory `source` indicator:
- `synthetic_demo`: Reproducibly generated historical records (seed=42) used to establish baseline analytics, historical benchmarks, and train initial predictive models.
- `live_demo`: Fresh complaints registered through the interactive web application, persisted in SQLite for live campus operations and administrative review.
- `authorized_real_data`: Reserved identifier for future vetted college institutional deployments.

---

## 2. Complaint Schema (`complaints` table & `data/synthetic_complaints.csv`)

| Field Name | Type | Constraints / Allowed Values | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Internal database surrogate key. Never exposed to public end-users. |
| `complaint_id` | String(50) | Unique, Indexed, Format: `CFX-YYYY-XXXXX` | Public complaint reference number. Safe to share with student or technician. |
| `user_id` | Integer | Nullable, Foreign Key -> `users.id` | Associated campus account ID for identified complaints. `NULL` for anonymous submissions. |
| `is_anonymous` | Boolean | True / False | Privacy flag indicating whether the reporter submitted without account association. |
| `tracking_token_hash`| String(128) | Nullable, Indexed, Salted SHA-256 | Cryptographic hash of the secret tracking token. Plaintext token is never stored in DB. |
| `category` | String(100) | Categorical (8 core options) | Maintenance domain (e.g., Wi-Fi, Electrical, Plumbing, Lab Equipment). |
| `location` | String(100) | Categorical (9 core campus zones) | Specific room or campus zone where maintenance problem is situated. |
| `severity` | String(50) | Low, Medium, High, Critical | Problem urgency and impact level. |
| `description` | Text | 10 to 2000 characters | Narrative detail describing physical fault or malfunction. |
| `status` | String(50) | Submitted, Acknowledged, In Progress, On Hold, Resolved, Reopened | Current operational state in complaint lifecycle. |
| `source` | String(50) | synthetic_demo, live_demo | Data origin marker to prevent contamination of ML training pipelines. |
| `submitted_at` | DateTime | UTC Timestamp | Exact point in time when complaint was recorded. |
| `predicted_resolution_hours` | Float | Nullable, Non-negative (hours) | Estimation produced by the active machine learning pipeline upon submission. |
| `prediction_model_version` | String(50) | Nullable | Identifier of ML pipeline artifact used to calculate predicted duration. |
| `resolved_at` | DateTime | Nullable, UTC Timestamp | Point in time when maintenance technician successfully marked the fault as resolved. |
| `priority_flag` | Boolean | True / False | Administrative escalation marker. |
| `created_at` | DateTime | UTC Timestamp | Row insertion timestamp. |
| `updated_at` | DateTime | UTC Timestamp | Row last modification timestamp. |

---

## 3. Allowed Domain Values

### Categories
1. `Wi-Fi and network connectivity` (Access points, Ethernet drops, IP allocation, portal connectivity)
2. `Computer laboratory equipment` (Desktops, monitors, mice, keyboards, blue-screens, hardware fans)
3. `Electrical issues` (Lighting, switchboards, sparks, breakers, emergency illumination)
4. `Plumbing and water supply` (Restroom faucets, dispensers, water coolers, washbasins, drainage)
5. `Projectors and classroom equipment` (Ceiling projectors, audio PA, motorized screens, HDMI plates)
6. `Furniture and infrastructure` (Benches, classroom doors, window glass, lab swivel chairs)
7. `Cleanliness and sanitation` (Carpet cleaning, trash bins, whiteboard chemical stains, ventilation louvers)
8. `Other maintenance issues` (Notice boards, door closers, blinds, clocks)

### Campus Locations
1. `Computer Lab`
2. `Electronics Lab`
3. `Library`
4. `Classroom Block A`
5. `Classroom Block B`
6. `Auditorium`
7. `Administrative Block`
8. `Cafeteria`
9. `Campus Common Area`

### Severities
- `Critical`: Immediate hazard, safety risk, or complete lab/exam shutdown (High priority response).
- `High`: Substantial disruption to academic or campus workflow.
- `Medium`: Normal operational defect with viable workarounds.
- `Low`: Minor cosmetic or non-blocking maintenance request.

---

## 4. Status Audit History Schema (`complaint_status_history` table)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `complaint_id` | Integer (FK) | Reference to parent complaint record. Cascade deleted if complaint removed. |
| `old_status` | String(50) | Previous lifecycle status (`NULL` on initial filing). |
| `new_status` | String(50) | New lifecycle status. |
| `public_remark` | Text | Public note visible to complainant on the tracking page and user dashboard. |
| `internal_note` | Text | **CONFIDENTIAL**: Internal operations note visible only to maintenance administrators. |
| `updated_by_user_id`| Integer (FK) | User ID of staff member executing change (`NULL` for automated events). |
| `created_at` | DateTime | Audit timestamp. |

---

## 5. Machine Learning Features & Leakage Controls

### Inputs Available at Submission (Training & Inference):
- `category` (One-hot encoded)
- `location` (One-hot encoded)
- `severity` (One-hot encoded)
- `submission_hour` (Standardized integer 0–23)
- `submission_day_of_week` (Standardized integer 0–6)

### Target Variable (Training Only):
- `resolution_hours`: `(resolved_at - submitted_at)` in hours (float, non-negative).

### Strictly Excluded (Data Leakage Prevention):
- `resolved_at`
- Future status timestamps
- Internal remarks / technician notes
- Queue status after submission
- Complainant identity or contact information

