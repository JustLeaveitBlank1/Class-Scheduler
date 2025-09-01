from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import instructor as instructor_crud

router = APIRouter(prefix="/instructors", tags=["Instructors"])

# Dependecy to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.InstructorRead])
def read_instructors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return instructor_crud.get_instructors(db, skip=skip, limit=limit)

@router.get("/{instructor_id}", response_model=schemas.InstructorRead)
def read_instructor(instructor_id: int, db: Session = Depends(get_db)):
    db_instructor = instructor_crud.get_instructor(db, instructor_id)
    if not db_instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return db_instructor

@router.post("/", response_model=schemas.InstructorRead)
def create_instructor(instructor: schemas.InstructorCreate, db: Session = Depends(get_db)):
    return instructor_crud.create_instructor(db, instructor)

@router.put("/{instructor_id}", response_model=schemas.InstructorRead)
def update_instructor(instructor_id: int, instructor: schemas.InstructorUpdate, db: Session = Depends(get_db)):
    db_instructor = instructor_crud.update_instructor(db, instructor_id, instructor)
    if not db_instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return db_instructor

@router.delete("/{instructor_id}", response_model=schemas.InstructorRead)
def delete_instructor(instructor_id: int, db: Session = Depends(get_db)):
    db_instructor = instructor_crud.delete_instructor(db, instructor_id)
    if not db_instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return db_instructor
