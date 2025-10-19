from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from typing import Optional
from app.db import models, schemas
from app.services.utils import recalc_instructor_load

# ---------- Helper Functions ----------

def parse_time(tstr: str):
    # Convert a 'HH:MM' 24-hour string to a time object
    return datetime.strptime(tstr, "%H:%M").time()

def times_overlap(start1, end1, start2, end2):
    s1, e1, s2, e2 = map(parse_time, (start1, end1, start2, end2))
    return s1 < e2 and s2 < e1

def check_section_conflicts(db: Session, section_data, section_id: Optional[int]=None):
    # Dynamically check for schedule conflicts
    # section_data: a Pydantic SectionCreate/Update object
    # section_id: exclude this Id when updating
    mt = db.query(models.MeetingTime).filter(models.MeetingTime.id == section_data.meeting_time_id).first()
    if not mt:
        raise HTTPException(status_code=400, detail="Invalid meeting time")
    
    # Gather all other sections using same instructor or room
    query = (
        db.query(models.Section)
        .join(models.MeetingTime)
        .filter(
            (models.Section.instructor_id == section_data.instructor_id) |
            (models.Section.room_id == section_data.room_id)
        )
    )
    if section_id:
        query = query.filter(models.Section.id != section_id)

    other_sections = query.all()

    for s in other_sections:
        s_mt = s.meeting_time
        if s_mt.day_of_week == mt.day_of_week and times_overlap(
            mt.start_time, mt.end_time, s_mt.start_time, s_mt.end_time
        ):
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Schedule conflict detected",
                    "conflicting_section": {
                        "id": s.id,
                        "course": s.course.name,
                        "instructor": s.instructor.name,
                        "room": s.room.name,
                        "meeting_time": {
                            "day_of_week": s_mt.day_of_week,
                            "start_time": s_mt.start_time,
                            "end_time": s_mt.end_time
                        }
                    }
                }
            )
        
# ---------- CRUD Operations ----------

def get_sections(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Section).offset(skip).limit(limit).all()

def get_section(db: Session, section_id: int):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail=f"Section with id '{section_id}' not found")
    return section

def create_section(db: Session, section: schemas.SectionCreate):
    # Validate for conflicts before creating
    check_section_conflicts(db, section)

    db_section = models.Section(**section.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)

    # Always recalc loads from scratch
    recalc_instructor_load(db, db_section.instructor_id)
    return db_section

def update_section(db: Session, section_id: int, section: schemas.SectionUpdate):
    db_section = get_section(db, section_id)

    # Validate before applying changes
    check_section_conflicts(db, section, section_id)
    
    for key, value in section.model_dump(exclude_unset=True).items():
        setattr(db_section, key, value)

    db.commit()
    db.refresh(db_section)

    # Recalc load for instructor
    recalc_instructor_load(db, db_section.instructor_id)
    return db_section

def delete_section(db: Session, section_id: int):
    db_section = get_section(db, section_id)
    instructor_id = db_section.instructor_id

    db.delete(db_section)
    db.commit()

    # Recalc load after removal
    recalc_instructor_load(db, instructor_id)
    return db_section
