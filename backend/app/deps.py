from typing import Generator
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db import models as m
from app.core.config import SESSION_COOKIE  # <<< import from config

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> m.User:
    """
    Authenticate via HttpOnly cookie only (no OAuth2/JWT).
    """
    user_id = request.cookies.get(SESSION_COOKIE)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = db.get(m.User, int(user_id))  # SQLAlchemy 2.x style
    if not user or not bool(user.is_active):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return user
