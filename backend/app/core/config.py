import os
from typing import Literal, Optional
from dotenv import load_dotenv

load_dotenv()  # loads backend/.env if present

# --- security / jwt ---
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# --- cookie config (typed the way Starlette/FastAPI expects) ---
SESSION_COOKIE: str = os.getenv("SESSION_COOKIE", "sc_session")

_raw_same = (os.getenv("SESSION_COOKIE_SAMESITE") or "lax").lower()
if _raw_same not in {"lax", "strict", "none"}:
    _raw_same = "lax"
# Literal typing so editors stop complaining; at runtime it's just a string or None
SESSION_COOKIE_SAMESITE: Optional[Literal["lax", "strict", "none"]] = _raw_same  # type: ignore[assignment]

SESSION_COOKIE_SECURE: bool = (os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true")
SESSION_COOKIE_DOMAIN: Optional[str] = os.getenv("SESSION_COOKIE_DOMAIN") or None
SESSION_COOKIE_PATH: str = os.getenv("SESSION_COOKIE_PATH", "/")
SESSION_COOKIE_MAX_AGE: int = int(os.getenv("SESSION_COOKIE_MAX_AGE", str(7 * 24 * 3600)))
