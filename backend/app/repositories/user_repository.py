from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.models.user import User


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        normalized_email = email.strip().lower()
        return db.query(User).filter(User.email == normalized_email).first()

    @staticmethod
    def create(db: Session, display_name: str, email: str, password_hash: str, role: str = "campus_user") -> User:
        user = User(
            display_name=display_name.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_all(db: Session) -> List[User]:
        return db.query(User).all()

