import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.db.session import SessionLocal
from backend.app.db.base import init_db
from backend.app.models.user import User


def seed_demo_accounts():
    """Seed default development demo accounts if they do not exist."""
    init_db()
    db: Session = SessionLocal()

    accounts = [
        {
            "display_name": settings.DEMO_ADMIN_NAME,
            "email": settings.DEMO_ADMIN_EMAIL,
            "password": settings.DEMO_ADMIN_PASSWORD,
            "role": "admin",
        },
        {
            "display_name": settings.DEMO_ANALYST_NAME,
            "email": settings.DEMO_ANALYST_EMAIL,
            "password": settings.DEMO_ANALYST_PASSWORD,
            "role": "analyst",
        },
        {
            "display_name": settings.DEMO_USER_NAME,
            "email": settings.DEMO_USER_EMAIL,
            "password": settings.DEMO_USER_PASSWORD,
            "role": "campus_user",
        },
    ]

    try:
        for acc in accounts:
            existing = db.query(User).filter(User.email == acc["email"].lower()).first()
            if not existing:
                user = User(
                    display_name=acc["display_name"],
                    email=acc["email"].lower(),
                    password_hash=hash_password(acc["password"]),
                    role=acc["role"],
                    is_active=True,
                )
                db.add(user)
                print(f"Created demo account: {acc['email']} ({acc['role']})")
            else:
                print(f"Demo account already exists: {acc['email']} ({existing.role})")
        db.commit()
        print("Demo accounts provisioning complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_accounts()
