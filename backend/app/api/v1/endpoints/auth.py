from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import create_session_token
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse, AuthSessionResponse
from backend.app.services.auth_service import AuthService, get_current_user, get_current_user_optional

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_auth_cookie(response: Response, user: User) -> str:
    token = create_session_token(
        user_id=user.id,
        role=user.role,
        email=user.email,
        display_name=user.display_name,
    )
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite=settings.SAME_SITE_POLICY,
        path="/",
    )
    return token


@router.post("/register", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Register a new identified campus user account."""
    user = AuthService.register_user(
        db=db,
        display_name=user_in.display_name,
        email=user_in.email,
        password=user_in.password,
        role="campus_user",  # Public registration strictly assigns campus_user
    )
    _set_auth_cookie(response, user)
    return AuthSessionResponse(user=UserResponse.model_validate(user), message="Account created successfully.")


@router.post("/login", response_model=AuthSessionResponse)
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticate campus user, administrator, or analyst."""
    user = AuthService.authenticate_user(db=db, email=credentials.email, password=credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
        )
    _set_auth_cookie(response, user)
    return AuthSessionResponse(user=UserResponse.model_validate(user), message="Signed in successfully.")


@router.post("/logout")
def logout(response: Response):
    """Clear session cookie and invalidate local session."""
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    return {"message": "Signed out successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current authenticated user."""
    return UserResponse.model_validate(current_user)

