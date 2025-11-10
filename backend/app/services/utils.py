from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import models


def recalc_instructor_load(db: Session, instructor_id: int) -> int:
    """Recalculate and update the instructor's total teaching load."""

    total_hours = (
        db.query(func.sum(models.Course.credit_hours))
        .join(models.Section, models.Section.course_id == models.Course.id)
        .filter(models.Section.instructor_id == instructor_id)
        .scalar()
        or 0
    )

    instructor = db.query(models.Instructor).filter_by(id=instructor_id).first()
    if instructor:
        instructor.current_load = total_hours  # type: ignore
        db.commit()
        db.refresh(instructor)

    return total_hours
