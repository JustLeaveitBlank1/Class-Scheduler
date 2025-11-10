from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import models as m
from app.db import schemas as s
from app.deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=s.UserRead)
def read_me(current: m.User = Depends(get_current_user)):
    return current

@router.get("/", response_model=list[s.UserRead])
def list_users(
    db: Session = Depends(get_db),
    current: m.User = Depends(get_current_user),
):
    return db.query(m.User).order_by(m.User.id.asc()).all()

@router.get("/{user_id}", response_model=s.UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: m.User = Depends(get_current_user),
):
    u = db.get(m.User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found.")
    return u

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: m.User = Depends(get_current_user),
):
    u = db.get(m.User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(u)
    db.commit()
