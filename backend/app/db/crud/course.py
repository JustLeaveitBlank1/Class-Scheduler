from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db import models, schemas

def get_courses(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def get_course(db: Session, course_id: int):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with id '{course_id}' not found")
    return course

def create_course(db: Session, course: schemas.CourseCreate):
    # Check for duplicate code & name
    existing_code = db.query(models.Course).filter(models.Course.code == course.code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail=f"Course with code '{course.code}' already exists")
    
    existing_name = db.query(models.Course).filter(models.Course.name == course.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail=f"Course with name '{course.name}' already exists")

    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, course_id: int, course_update: schemas.CourseUpdate):
    db_course = get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only include explicitly provided fields
    update_data = course_update.model_dump(exclude_unset=True)

    # Check for duplicate course code -- if being changed
    if "code" in update_data:
        existing_code = (
            db.query(models.Course)
            .filter(models.Course.code == update_data["code"], models.Course.id != course_id)
            .first()
        )
        if existing_code:
            raise HTTPException(status_code=400, detail=f"Course code '{update_data['code']}' already exists")
    
    # Check for duplicate course name -- if being changed
    if "name" in update_data:
        existing_name = (
            db.query(models.Course)
            .filter(models.Course.name == update_data["name"], models.Course.id != course_id)
            .first()
        )
        if existing_name:
            raise HTTPException(status_code=400, detail=f"Course name '{update_data['name']}' already exists")
        
    # Apply partial update
    for key, value in update_data.items():
        setattr(db_course, key, value)

    db.commit()
    db.refresh(db_course)
    return db_course

def delete_course(db: Session, course_id: int):
    db_course = get_course(db, course_id)
    db.delete(db_course)
    db.commit()
    return db_course
