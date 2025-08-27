from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import database, models

router = APIRouter(prefix="/instructors", tags=["Instructors"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_instructors(db: Session = Depends(get_db)):
    return db.query(models.Instructor).all()

@router.post("/")
def create_instructor(name: str, max_load: int = 15, db: Session = Depends(get_db)):
    new_instructor = models.Instructor(name=name, max_load=max_load)
    db.add(new_instructor)
    db.commit()
    db.refresh(new_instructor)
    return new_instructor
