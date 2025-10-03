from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import conflict as conflict_crud

router = APIRouter(prefix="/conflicts", tags=["Conflicts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.ConflictRead])
def read_conflicts(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return conflict_crud.get_conflicts(db, skip=skip, limit=limit)

@router.get("/{conflict_id}", response_model=schemas.ConflictRead)
def read_conflict(conflict_id: int, db: Session=Depends(get_db)):
    db_conflict = db.query(conflict_crud.models.Conflict).filter(
        conflict_crud.models.Conflict.id == conflict_id
    ).first()
    if not db_conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
    return db_conflict
