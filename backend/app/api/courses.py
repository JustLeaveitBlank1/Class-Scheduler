from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import database, models

router = APIRouter(prefix="/courses", tags=["Courses"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@router.post("/")
def create_course(name: str, credit_hours: int, contact_hours: int, db: Session = Depends(get_db)):
    new_course = models.Course(name=name, credit_hours=credit_hours, contact_hours=contact_hours)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course
