from sqlalchemy.orm import Session
from app.db import models, schemas
from fastapi import HTTPException

def get_instructors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Instructor).offset(skip).limit(limit).all()

def get_instructor(db: Session, instructor_id: int):
    instructor = db.query(models.Instructor).filter(models.Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail=f"Instructor with id '{instructor_id}' not found")
    return instructor

def create_instructor(db: Session, instructor: schemas.InstructorCreate):
    # Check for duplicate email
    existing_email = db.query(models.Instructor).filter(models.Instructor.email == instructor.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email '{instructor.email}' is already in use")
    
    # Check for duplicate name
    existing_name = db.query(models.Instructor).filter(models.Instructor.name == instructor.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail=f"Instructor name '{instructor.name}' already exists")

    db_instructor = models.Instructor(**instructor.model_dump())
    db.add(db_instructor)
    db.commit()
    db.refresh(db_instructor)
    return db_instructor

def update_instructor(db: Session, instructor_id: int, instructor: schemas.InstructorUpdate):
    db_instructor = get_instructor(db, instructor_id) # raises 404 if not found

    # Prevent duplicate email if updating
    if instructor.email:
        existing_email = (
            db.query(models.Instructor)
            .filter(models.Instructor.email == instructor.email, models.Instructor.id != instructor_id)
            .first()
        )
        if existing_email:
            raise HTTPException(status_code=400, detail=f"Email '{instructor.email}' is already in use")
        
    # Prevent duplicate name if updating
    if instructor.name:
        existing_name = (
            db.query(models.Instructor)
            .filter(models.Instructor.name == instructor.name, models.Instructor.id != instructor_id)
            .first()
        )
        if existing_email:
            raise HTTPException(status_code=400, detail=f"Name '{instructor.name}' already exists")

    for key, value in instructor.model_dump(exclude_unset=True).items():
        setattr(db_instructor, key, value)

    db.commit()
    db.refresh(db_instructor)

    return db_instructor

def delete_instructor(db: Session, instructor_id: int):
    db_instructor = get_instructor(db, instructor_id) # raises 404 if not found
    db.delete(db_instructor)
    db.commit()
    return db_instructor
