from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.hash import pbkdf2_sha256

from app.core.config import SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# -------- Password hashing / verifying --------
def verify_password(plain: str, hashed: str) -> bool:
    return pbkdf2_sha256.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pbkdf2_sha256.hash(plain)

# -------- Token helpers --------
def _encode(payload: dict, minutes: int) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=minutes)
    to_encode = {**payload, "exp": exp}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    """JWT used for normal auth (purpose='access')."""
    return _encode(
        {"sub": subject, "purpose": "access"},
        expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES,
    )

def create_reset_token(subject: str, expires_minutes: int = 15) -> str:
    """Short-lived JWT for password resets (purpose='reset')."""
    return _encode({"sub": subject, "purpose": "reset"}, expires_minutes)

def decode_token(token: str) -> dict:
    """Low-level decode (raises on invalid tokens)."""
    return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])

def verify_reset_token(token: str) -> Optional[str]:
    """
    Safe validator for reset tokens.
    Returns the email (subject) if valid & purpose=='reset', else None.
    """
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if data.get("purpose") != "reset":
            return None
        return data.get("sub")
    except JWTError:
        return None
