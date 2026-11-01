import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import random
import csv
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import generate_complaint_id, hash_tracking_token
from backend.app.db.session import SessionLocal
from backend.app.db.base import init_db
from backend.app.models.complaint import Complaint
from backend.app.models.history import ComplaintStatusHistory

RANDOM_SEED = 42

CATEGORIES = [
    "Wi-Fi and network connectivity",
    "Computer laboratory equipment",
    "Electrical issues",
    "Plumbing and water supply",
    "Projectors and classroom equipment",
    "Furniture and infrastructure",
    "Cleanliness and sanitation",
    "Other maintenance issues",
]

LOCATIONS = [
    "Computer Lab",
    "Electronics Lab",
    "Library",
    "Classroom Block A",
    "Classroom Block B",
    "Auditorium",
    "Administrative Block",
    "Cafeteria",
    "Campus Common Area",
]

SEVERITIES = ["Low", "Medium", "High", "Critical"]

# Realistic resolution time multipliers (in hours)
CATEGORY_BASE_HOURS = {
    "Cleanliness and sanitation": 4.0,
    "Wi-Fi and network connectivity": 8.0,
    "Electrical issues": 12.0,
    "Computer laboratory equipment": 18.0,
    "Plumbing and water supply": 14.0,
    "Projectors and classroom equipment": 24.0,
    "Furniture and infrastructure": 48.0,
    "Other maintenance issues": 20.0,
}

SEVERITY_MULTIPLIERS = {
    "Critical": 0.4,  # Handled quickly due to urgency
    "High": 0.7,
    "Medium": 1.0,
    "Low": 1.6,       # Lower queue priority
}

DESCRIPTIONS = {
    "Wi-Fi and network connectivity": [
        "Unstable Wi-Fi signal dropping connections during active lab sessions.",
        "Access point indicator light is red, no device can acquire IP address.",
        "Bandwidth severely throttled; cannot load online academic journals or course portal.",
        "Ethernet wall port is loose and disconnected from network rack.",
    ],
    "Computer laboratory equipment": [
        "Desktop terminal #14 blue-screens immediately on boot.",
        "Three monitors flickering continuously and failing to receive HDMI feed.",
        "Keyboard keys stuck and optical mouse not tracking on workstation B-04.",
        "CPU cooling fan making loud grinding noise; overheating observed.",
    ],
    "Electrical issues": [
        "Ceiling lights flickering intermittently on the third row.",
        "Power switchboard sparking when plugging in laptop charger.",
        "Emergency exit illumination panel dark and unpowered.",
        "Tripped circuit breaker after heavy appliance usage.",
    ],
    "Plumbing and water supply": [
        "Restroom faucet leaking steadily, causing water accumulation on floor.",
        "Low water pressure at second-floor drinking water dispenser.",
        "Drain pipe under washbasin leaking onto lower cabinet.",
        "Water cooler filter alert glowing red; dispensing warm water.",
    ],
    "Projectors and classroom equipment": [
        "Ceiling projector bulb burned out, dim display with severe color distortion.",
        "Audio system buzzing loudly through classroom speakers.",
        "Motorized projector screen stuck halfway down.",
        "VGA/HDMI wall patch plate disconnected.",
    ],
    "Furniture and infrastructure": [
        "Wooden study bench broken at left weld support.",
        "Classroom door latch stuck; difficult to shut or lock.",
        "Window pane cracked near rear study section.",
        "Lab swivel chair hydraulic cylinder failed, stuck at lowest height.",
    ],
    "Cleanliness and sanitation": [
        "Spilled beverage on carpet near reading section needing wet vacuuming.",
        "Trash receptacle overflowing after afternoon session.",
        "Whiteboard stained with permanent marker; requires chemical cleaning.",
        "Dust accumulation on ventilation louvers causing poor air quality.",
    ],
    "Other maintenance issues": [
        "Notice board glass casing broken; posters falling out.",
        "Door closer mechanism leaking oil and slamming doors shut.",
        "Blinds cord snapped, unable to adjust afternoon sun glare.",
        "Lobby clock stopped and displaying incorrect time.",
    ],
}


def generate_synthetic_records(count: int = 500) -> List[Dict[str, Any]]:
    """Generate reproducible realistic synthetic complaint records."""
    random.seed(RANDOM_SEED)
    now = datetime.now(timezone.utc)
    records = []

    for i in range(count):
        # Specific recurring clusters to simulate real-world hot-spots
        if i % 15 == 0:
            category = "Wi-Fi and network connectivity"
            location = "Computer Lab"
            severity = "High"
        elif i % 20 == 0:
            category = "Projectors and classroom equipment"
            location = "Classroom Block A"
            severity = "Medium"
        elif i % 25 == 0:
            category = "Plumbing and water supply"
            location = "Cafeteria"
            severity = "Medium"
        else:
            category = random.choice(CATEGORIES)
            location = random.choice(LOCATIONS)
            severity = random.choices(SEVERITIES, weights=[0.25, 0.40, 0.25, 0.10])[0]

        # Timestamp spread across the past 90 days
        days_ago = random.uniform(1.0, 90.0)
        submitted_at = now - timedelta(days=days_ago)

        # Status distribution (older ones mostly resolved, recent ones may be open)
        if days_ago < 5:
            status = random.choices(["Submitted", "Acknowledged", "In Progress", "Resolved"], weights=[0.4, 0.3, 0.2, 0.1])[0]
        elif days_ago < 15:
            status = random.choices(["Acknowledged", "In Progress", "On Hold", "Resolved"], weights=[0.1, 0.3, 0.1, 0.5])[0]
        else:
            status = random.choices(["Resolved", "In Progress", "On Hold"], weights=[0.90, 0.07, 0.03])[0]

        resolved_at = None
        actual_hours = None

        if status == "Resolved":
            base_hrs = CATEGORY_BASE_HOURS[category]
            sev_mult = SEVERITY_MULTIPLIERS[severity]
            # Add realistic log-normal variance
            variation = random.uniform(0.7, 1.4)
            duration_hours = max(1.0, round(base_hrs * sev_mult * variation, 2))
            actual_hours = duration_hours
            resolved_at = submitted_at + timedelta(hours=duration_hours)
            # Ensure resolved_at does not exceed now
            if resolved_at > now:
                resolved_at = now - timedelta(minutes=random.randint(10, 120))
                actual_hours = round(max(0.5, (resolved_at - submitted_at).total_seconds() / 3600.0), 2)

        description = random.choice(DESCRIPTIONS[category])
        is_anon = random.choice([True, False])
        tracking_token = f"cfx_sec_synth_{i}_{random.randint(1000, 9999)}"
        token_hash = hash_tracking_token(tracking_token)

        records.append({
            "complaint_id": f"CFX-SYNTH-{10000 + i}",
            "category": category,
            "location": location,
            "severity": severity,
            "description": description,
            "status": status,
            "source": "synthetic_demo",
            "is_anonymous": is_anon,
            "tracking_token_hash": token_hash,
            "submitted_at": submitted_at.isoformat(),
            "resolved_at": resolved_at.isoformat() if resolved_at else None,
            "resolution_hours": actual_hours,
        })

    return records


def seed_database_and_export_csv():
    """Seed synthetic records into SQLite database and export to CSV."""
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if synthetic records already exist to ensure idempotency
        existing_count = db.query(Complaint).filter(Complaint.source == "synthetic_demo").count()
        records = generate_synthetic_records(500)

        # Always ensure CSV is written
        os.makedirs("data", exist_ok=True)
        csv_path = os.path.join("data", "synthetic_complaints.csv")
        fieldnames = [
            "complaint_id", "category", "location", "severity", "description",
            "status", "source", "is_anonymous", "tracking_token_hash",
            "submitted_at", "resolved_at", "resolution_hours"
        ]

        with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        print(f"Exported {len(records)} synthetic complaints to {csv_path}")

        if existing_count >= 500:
            print(f"Database already contains {existing_count} synthetic records. Skipping DB re-insertion.")
            return

        print(f"Seeding {len(records)} synthetic records into database...")
        for r in records:
            sub_dt = datetime.fromisoformat(r["submitted_at"])
            res_dt = datetime.fromisoformat(r["resolved_at"]) if r["resolved_at"] else None

            complaint = Complaint(
                complaint_id=r["complaint_id"],
                category=r["category"],
                location=r["location"],
                severity=r["severity"],
                description=r["description"],
                status=r["status"],
                source="synthetic_demo",
                is_anonymous=r["is_anonymous"],
                tracking_token_hash=r["tracking_token_hash"],
                user_id=None,
                submitted_at=sub_dt,
                resolved_at=res_dt,
                predicted_resolution_hours=None,
                prediction_model_version=None,
                priority_flag=r["severity"] == "Critical",
                created_at=sub_dt,
                updated_at=res_dt or sub_dt,
            )
            db.add(complaint)
            db.flush()

            # Status history for synthetic record
            history_init = ComplaintStatusHistory(
                complaint_id=complaint.id,
                old_status=None,
                new_status="Submitted",
                public_remark="Historical complaint submitted (synthetic archive).",
                internal_note="Synthetic historical baseline record for training.",
                updated_by_user_id=None,
                created_at=sub_dt,
            )
            db.add(history_init)

            if r["status"] == "Resolved" and res_dt:
                history_res = ComplaintStatusHistory(
                    complaint_id=complaint.id,
                    old_status="In Progress",
                    new_status="Resolved",
                    public_remark="Issue resolved and validated by maintenance technician.",
                    internal_note=f"Resolved in {r['resolution_hours']} hours.",
                    updated_by_user_id=None,
                    created_at=res_dt,
                )
                db.add(history_res)

        db.commit()
        print("Successfully seeded synthetic historical records into SQLite database.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database_and_export_csv()
