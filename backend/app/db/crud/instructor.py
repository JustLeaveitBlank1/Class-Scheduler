from sqlalchemy.orm import Session
from app.db import models, schemas

def get_instructors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Instructor).offset(skip).limit(limit).all()

def get_instructor(db: Session, instructor_id: int):
    return db.query(models.Instructor).filter(models.Instructor.id == instructor_id).first()

def create_instructor(db: Session, instructor: schemas.InstructorCreate):
    db_instructor = models.Instructor(**instructor.model_dump())
    db.add(db_instructor)
    db.commit()
    db.refresh(db_instructor)
    return db_instructor

def update_instructor(db: Session, instructor_id: int, instructor: schemas.InstructorUpdate):
    db_instructor = get_instructor(db, instructor_id)
    if db_instructor:
        for key, value in instructor.model_dump().items():
            setattr(db_instructor, key, value)
        db.commit()
        db.refresh(db_instructor)
    return db_instructor

def delete_instructor(db: Session, instructor_id: int):
    db_instructor = get_instructor(db, instructor_id)
    if db_instructor:
        db.delete(db_instructor)
        db.commit()
    return db_instructor
