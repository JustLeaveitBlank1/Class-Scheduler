# app/db/crud/section.py
from typing import cast

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db import models, schemas


# ---------- helpers ----------

def _require_fk(db: Session, model, obj_id: int, label: str) -> None:
    """Raise ValueError if a referenced row doesn't exist."""
    if db.get(model, obj_id) is None:
        raise ValueError(f"{label} id {obj_id} does not exist")


def _check_conflicts(
    db: Session,
    *,
    instructor_id: int,
    room_id: int,
    meeting_time_id: int,
    section_id_to_exclude: int | None = None,
) -> None:
    """Raise ValueError if the room or instructor is already booked for the time slot."""
    # Room/time conflict — use .first() to avoid SQL boolean-in-if warnings
    q1 = (
        db.query(models.Section.id)
        .filter(
            models.Section.room_id == room_id,
            models.Section.meeting_time_id == meeting_time_id,
        )
    )
    if section_id_to_exclude is not None:
        q1 = q1.filter(models.Section.id != section_id_to_exclude)
    if q1.first() is not None:
        raise ValueError("Room is already scheduled at that meeting time.")

    # Instructor/time conflict
    q2 = (
        db.query(models.Section.id)
        .filter(
            models.Section.instructor_id == instructor_id,
            models.Section.meeting_time_id == meeting_time_id,
        )
    )
    if section_id_to_exclude is not None:
        q2 = q2.filter(models.Section.id != section_id_to_exclude)
    if q2.first() is not None:
        raise ValueError("Instructor is already scheduled at that meeting time.")


def _check_capacity(db: Session, room_id: int, seats: int | None) -> None:
    """Raise ValueError if requested seats exceed the room capacity."""
    if seats is None:
        return
    if seats < 0:
        raise ValueError("Seats must be a non-negative integer.")

    room = db.get(models.Room, room_id)
    if room is None:
        # This should not happen if _require_fk ran, but fail loudly if it does.
        raise ValueError(f"Room id {room_id} does not exist")

    # Help the type checker (SQLA InstrumentedAttribute -> int at runtime)
    capacity: int = cast(int, room.capacity)  # assume NOT NULL in schema
    if seats > capacity:
        raise ValueError(
            f"Requested seats ({seats}) exceed room capacity ({capacity})."
        )


# ---------- CRUD ----------

def list_sections(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    instructor_id: int | None = None,
    room_id: int | None = None,
) -> list[models.Section]:
    q = db.query(models.Section)
    if instructor_id is not None:
        q = q.filter(models.Section.instructor_id == instructor_id)
    if room_id is not None:
        q = q.filter(models.Section.room_id == room_id)
    return q.offset(skip).limit(limit).all()


def get_section(db: Session, section_id: int) -> models.Section | None:
    return db.query(models.Section).filter(models.Section.id == section_id).first()


def create_section(db: Session, payload: schemas.SectionCreate) -> models.Section:
    data = payload.model_dump()

    # FK existence checks
    _require_fk(db, models.Course,      data["course_id"],       "Course")
    _require_fk(db, models.Instructor,  data["instructor_id"],   "Instructor")
    _require_fk(db, models.Room,        data["room_id"],         "Room")
    _require_fk(db, models.MeetingTime, data["meeting_time_id"], "MeetingTime")

    # Business rules
    _check_conflicts(
        db,
        instructor_id=data["instructor_id"],
        room_id=data["room_id"],
        meeting_time_id=data["meeting_time_id"],
    )
    _check_capacity(db, data["room_id"], data.get("seats"))

    sec = models.Section(**data)
    db.add(sec)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # If the DB unique constraints fired, translate to a friendlier message.
        raise ValueError("Unique constraint hit: conflict detected.")
    db.refresh(sec)
    return sec


def update_section(
    db: Session, section_id: int, payload: schemas.SectionUpdate
) -> models.Section | None:
    _sec = get_section(db, section_id)
    if not _sec:
        return None

    # Narrow the type for the checker (instance, not class)
    sec: models.Section = _sec

    # Apply allowed fields
    changes = payload.model_dump(exclude_unset=True)
    for k, v in changes.items():
        setattr(sec, k, v)

    # If FKs were updated, validate they exist (casts quiet Pylance)
    if "course_id" in changes:
        _require_fk(db, models.Course,      cast(int, sec.course_id),       "Course")
    if "instructor_id" in changes:
        _require_fk(db, models.Instructor,  cast(int, sec.instructor_id),   "Instructor")
    if "room_id" in changes:
        _require_fk(db, models.Room,        cast(int, sec.room_id),         "Room")
    if "meeting_time_id" in changes:
        _require_fk(db, models.MeetingTime, cast(int, sec.meeting_time_id), "MeetingTime")

    # Re-check rules on the new values (casts quiet Pylance)
    _check_conflicts(
        db,
        instructor_id=cast(int, sec.instructor_id),
        room_id=cast(int, sec.room_id),
        meeting_time_id=cast(int, sec.meeting_time_id),
        section_id_to_exclude=cast(int, sec.id),
    )
    _check_capacity(db, cast(int, sec.room_id), cast(int | None, sec.seats))

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Unique constraint hit: conflict detected.")
    db.refresh(sec)
    return sec


def delete_section(db: Session, section_id: int) -> models.Section | None:
    sec = get_section(db, section_id)
    if not sec:
        return None
    db.delete(sec)
    db.commit()
    return sec
