from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import course as course_crud

router = APIRouter(prefix="/courses", tags=["Courses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.CourseRead])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return course_crud.get_courses(db, skip=skip, limit=limit)

@router.get("/{course_id}", response_model=schemas.CourseRead)
def read_course(course_id: int, db: Session = Depends(get_db)):
    db_course = course_crud.get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.post("/", response_model=schemas.CourseRead)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    return course_crud.create_course(db, course)

@router.put("/{course_id}", response_model=schemas.CourseRead)
def update_course(course_id: int, course: schemas.CourseUpdate, db: Session = Depends(get_db)):
    db_course = course_crud.update_course(db, course_id, course)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.delete("/{course_id}", response_model=schemas.CourseRead)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = course_crud.delete_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course
