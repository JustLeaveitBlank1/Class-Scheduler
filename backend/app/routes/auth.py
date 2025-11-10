from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.db import models as m, schemas as s
from app.deps import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_reset_token,
    verify_reset_token,
)
from app.services.emailer import send_password_reset
from app.core.config import (
    SESSION_COOKIE,
    SESSION_COOKIE_SAMESITE,
    SESSION_COOKIE_SECURE,
    SESSION_COOKIE_DOMAIN,
    SESSION_COOKIE_PATH,
    SESSION_COOKIE_MAX_AGE,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# -------- Signup --------
@router.post("/signup", response_model=s.UserRead, status_code=status.HTTP_201_CREATED)
def signup(payload: s.UserCreate, db: Session = Depends(get_db)):
    if db.query(m.User).filter(m.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = m.User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# -------- Login --------
@router.post("/login", response_model=s.Token)
def login(payload: s.LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(m.User).filter(m.User.email == payload.email).first()
    # cast to str so static checkers stop complaining; runtime already ok
    if not user or not verify_password(payload.password, str(user.hashed_password)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    token = create_access_token(subject=str(user.email))

    # Build kwargs with correct types
    cookie_kwargs: Dict[str, Any] = dict(
        key=SESSION_COOKIE,
        value=str(user.id),                 # value MUST be str
        max_age=SESSION_COOKIE_MAX_AGE,     # int
        httponly=True,                      # bool
        secure=SESSION_COOKIE_SECURE,       # bool
        samesite=SESSION_COOKIE_SAMESITE,   # 'lax' | 'strict' | 'none' | None
        path=SESSION_COOKIE_PATH,           # str
    )
    if SESSION_COOKIE_DOMAIN:
        cookie_kwargs["domain"] = SESSION_COOKIE_DOMAIN  # Optional[str]

    response.set_cookie(**cookie_kwargs)
    return s.Token(access_token=token)

# -------- Logout (clear cookie) --------
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=SESSION_COOKIE,
        path=SESSION_COOKIE_PATH,
        domain=SESSION_COOKIE_DOMAIN,
    )
    return {"ok": True}

# -------- Who am I? --------
@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get(SESSION_COOKIE)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = db.get(m.User, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return {"email": user.email, "full_name": user.full_name}

# -------- Forgot / Reset --------
@router.post("/forgot-password", status_code=200)
def forgot_password(payload: s.ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(m.User).filter(m.User.email == payload.email).first()
    if user:
        token = create_reset_token(subject=str(user.email), expires_minutes=15)
        base = str(request.base_url).rstrip("/")
        reset_url = f"{base}/reset-password?token={token}"
        send_password_reset(to_email=str(user.email), reset_url=reset_url)
    return {"message": "If that account exists, a reset email has been sent."}

@router.post("/reset-password", status_code=200)
def reset_password(payload: s.ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_token(payload.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")
    user = db.query(m.User).filter(m.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.hashed_password = hash_password(payload.new_password)  # type: ignore[assignment]
    db.add(user)
    db.commit()
    return {"message": "Password updated."}
