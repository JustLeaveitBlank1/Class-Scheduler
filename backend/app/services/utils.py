from sqlalchemy.orm import Session
from app.db import models

def recalc_instructor_load(db: Session, instructor_id: int) -> int:
    # Recalculate the instructor's load based on all assigned sections
    total = (
        db.query(models.Course.credit_hours)
        .join(models.Section, models.Section.course_id == models.Course.id)
        .filter(models.Section.instructor_id == instructor_id)
        .all()
    )
    total_hours = sum([t[0] for t in total])

    instructor = (
        db.query(models.Instructor)
        .filter(models.Instructor.id == instructor_id)
        .first()        
    )
    if instructor:
        instructor.current_load = total_hours
        db.add(instructor)
        db.commit()
        db.refresh(instructor)
    return total_hours
