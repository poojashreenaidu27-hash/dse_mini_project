from typing import Optional, List, Callable
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import verify_password, hash_password, decode_session_token
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.repositories.user_repository import UserRepository


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = UserRepository.get_by_email(db, email)
        if not user or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def register_user(
        db: Session, display_name: str, email: str, password: str, role: str = "campus_user"
    ) -> User:
        existing = UserRepository.get_by_email(db, email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )
        hashed_pwd = hash_password(password)
        return UserRepository.create(db, display_name, email, hashed_pwd, role=role)


def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Retrieve the current user from HTTP-only session cookie or Authorization header, if present."""
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        # Check Bearer authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return None

    payload = decode_session_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user = UserRepository.get_by_id(db, int(user_id))
        if user and user.is_active:
            return user
    except (ValueError, TypeError):
        return None

    return None


def get_current_user(user: Optional[User] = Depends(get_current_user_optional)) -> User:
    """Dependency for routes requiring an authenticated user."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource.",
        )
    return user


def require_roles(allowed_roles: List[str]) -> Callable:
    """Dependency factory enforcing strict role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required permission: {', '.join(allowed_roles)}.",
            )
        return current_user
    return role_checker

