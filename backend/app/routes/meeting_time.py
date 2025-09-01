from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import database, models

router = APIRouter(prefix="/assignments", tags=["Assignments"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_assignment(course_id: int, instructor_id: int, room_id: int, meeting_time_id: int, db: Session = Depends(get_db)):
    assignment = models.Section(
        course_id=course_id,
        instructor_id=instructor_id,
        room_id=room_id,
        meeting_time_id=meeting_time_id
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
