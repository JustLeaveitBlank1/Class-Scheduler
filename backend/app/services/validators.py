from typing import Optional
from sqlalchemy.orm import Session
from app.db import models as m

class ValidationError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

def check_capacity(db: Session, room_id: Optional[int], seats: Optional[int]) -> None:
    if seats is None or room_id is None:
        return
    room = db.query(m.Room).get(room_id)
    if not room:
        return
    if seats > room.capacity:
        raise ValidationError(f"Seats ({seats}) exceed room capacity ({room.capacity}).")

def check_section_number_unique(db: Session, course_id: int, section_number: Optional[str], exclude_id: Optional[int] = None) -> None:
    if not section_number:
        return
    q = db.query(m.Section).filter(
        m.Section.course_id == course_id,
        m.Section.section_number == section_number,
        m.Section.deleted_at.is_(None),
    )
    if exclude_id:
        q = q.filter(m.Section.id != exclude_id)
    if db.query(q.exists()).scalar():
        raise ValidationError("This course already has that section number.")

def check_conflicts(db: Session, meeting_time_id: int, instructor_id: Optional[int], room_id: Optional[int], exclude_id: Optional[int] = None) -> None:
    # Simple: same meeting_time_id means same time slot
    q = db.query(m.Section).filter(
        m.Section.meeting_time_id == meeting_time_id,
        m.Section.deleted_at.is_(None),
    )
    if exclude_id:
        q = q.filter(m.Section.id != exclude_id)

    if instructor_id:
        if q.filter(m.Section.instructor_id == instructor_id).first():
            raise ValidationError("Instructor is already booked at that time.")

    if room_id:
        if q.filter(m.Section.room_id == room_id).first():
            raise ValidationError("Room is already booked at that time.")
