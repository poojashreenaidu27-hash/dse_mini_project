import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError

from backend.app.core.config import settings

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash plaintext password using direct bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash using constant-time comparison."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def generate_complaint_id() -> str:
    """Generate a unique, unpredictable complaint identifier.
    Format: CFX-<YEAR>-<5 uppercase letters/digits>
    Example: CFX-2026-9M2KB
    """
    current_year = datetime.now(timezone.utc).year
    chars = string.ascii_uppercase + string.digits
    # Exclude ambiguous characters (0, O, 1, I)
    filtered_chars = "".join([c for c in chars if c not in "0O1I"])
    random_suffix = "".join(secrets.choice(filtered_chars) for _ in range(5))
    return f"CFX-{current_year}-{random_suffix}"


def generate_tracking_token() -> str:
    """Generate a cryptographically secure random tracking token.
    High entropy secret returned only once upon anonymous submission.
    """
    token_entropy = secrets.token_urlsafe(20)
    return f"cfx_sec_{token_entropy}"


def hash_tracking_token(token: str) -> str:
    """Compute SHA-256 hash of the tracking token for persistent storage."""
    # Salted with SECRET_KEY for extra defense-in-depth
    salt = settings.SECRET_KEY.encode("utf-8")
    return hmac.new(salt, token.strip().encode("utf-8"), hashlib.sha256).hexdigest()


def verify_tracking_token(plain_token: str, stored_hash: str) -> bool:
    """Verify a plain tracking token against stored hash using constant-time comparison."""
    if not plain_token or not stored_hash:
        return False
    computed_hash = hash_tracking_token(plain_token)
    return hmac.compare_digest(computed_hash, stored_hash)


def create_session_token(user_id: int, role: str, email: str, display_name: str) -> str:
    """Generate a signed JWT session token."""
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.SESSION_MAX_AGE_SECONDS)
    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "email": email,
        "name": display_name,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a signed JWT session token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
