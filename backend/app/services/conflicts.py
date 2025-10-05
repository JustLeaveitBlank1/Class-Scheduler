from sqlalchemy.orm import Session
from app.db import models

def check_conflicts(db: Session, new_section: models.Section):
    conflicts = []

    # Check for room conflicts
    room_conflicts = (
        db.query(models.Section)
        .filter(
            models.Section.room_id == new_section.room_id,
            models.Section.meeting_time_id == new_section.meeting_time_id,
            models.Section.id != new_section.id,
        )
        .all()
    )
    for conflict in room_conflicts:
        conflicts.append(models.Conflict(
            section_id=new_section.id,
            conflict_type="Room Conflict",
            description=f"Room {new_section.room_id} is double-booked with section {conflict.id}"
        )
    )

    # Check for instructor conflicts
    instructor_conflicts = (
        db.query(models.Section)
        .filter(
            models.Section.instructor_id == new_section.instructor_id,
            models.Section.meeting_time_id == new_section.meeting_time_id,
            models.Section.id != new_section.id,
        )
        .all()
    )
    for conflict in instructor_conflicts:
        conflicts.append(models.Conflict(
            section_id=new_section.id,
            conflict_type="Instructor Conflict",
            description=f"Instructor {new_section.instructor_id} is double-booked with section {conflict.id}"
        )
    )

    # Check for workload conflicts
    instructor = (
        db.query(models.Instructor)
        .filter(models.Instructor.id == new_section.instructor_id)
        .first()
    )
    if instructor:
        total_hours = (
            db.query(models.Course.credit_hours)
            .join(models.Section, models.Section.course_id == models.Course.id)
            .filter(models.Section.instructor_id == instructor.id)
            .all()
        )
        total_hours = sum([t[0] for t in total_hours])

        if total_hours > instructor.max_load:
            conflicts.append(models.Conflict(
                section_id=new_section.id,
                conflict_type="Workload Conflict",
                description=f"Instructor {instructor.name} is over max load ({instructor.current_load}/{instructor.max_load})"
            )
        )

    # Save conflicts
    db.add_all(conflicts)
    db.commit()
