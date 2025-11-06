# app/db/crud/section.py
from typing import cast
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func as sqla_func
from datetime import datetime, timezone

from app.db import models, schemas

# ---------- helpers ----------

def _hasattr_deleted_at() -> bool:
    # allows code to work whether you've added soft-delete or not
    return hasattr(models.Section, "deleted_at")

def _maybe_not_deleted(q):
    return q if not _hasattr_deleted_at() else q.filter(models.Section.deleted_at.is_(None))

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
    # Room/time conflict
    q1 = db.query(models.Section.id).filter(
        models.Section.room_id == room_id,
        models.Section.meeting_time_id == meeting_time_id,
    )
    q1 = _maybe_not_deleted(q1)
    if section_id_to_exclude is not None:
        q1 = q1.filter(models.Section.id != section_id_to_exclude)
    if q1.first() is not None:
        raise ValueError("Room is already scheduled at that meeting time.")

    # Instructor/time conflict
    q2 = db.query(models.Section.id).filter(
        models.Section.instructor_id == instructor_id,
        models.Section.meeting_time_id == meeting_time_id,
    )
    q2 = _maybe_not_deleted(q2)
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
        raise ValueError(f"Room id {room_id} does not exist")

    capacity: int = cast(int, room.capacity)
    if seats > capacity:
        raise ValueError(f"Requested seats ({seats}) exceed room capacity ({capacity}).")

def _maybe_check_section_number_unique(
    db: Session, course_id: int, section_number: str | None, exclude_id: int | None = None
) -> None:
    """If the model has section_number, ensure (course, section_number) unique."""
    if section_number is None or not hasattr(models.Section, "section_number"):
        return
    q = db.query(models.Section.id).filter(
        models.Section.course_id == course_id,
        models.Section.section_number == section_number,
    )
    q = _maybe_not_deleted(q)
    if exclude_id is not None:
        q = q.filter(models.Section.id != exclude_id)
    if q.first() is not None:
        raise ValueError("This course already has that section number.")

# ---------- CRUD ----------

def list_sections(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    instructor_id: int | None = None,
    room_id: int | None = None,
    course_id: int | None = None,
    status_: schemas.SectionStatus | None = None,
    include_deleted: bool = False,
) -> list[models.Section]:
    q = db.query(models.Section)
    if not include_deleted and _hasattr_deleted_at():
        q = q.filter(models.Section.deleted_at.is_(None))
    if instructor_id is not None:
        q = q.filter(models.Section.instructor_id == instructor_id)
    if room_id is not None:
        q = q.filter(models.Section.room_id == room_id)
    if course_id is not None:
        q = q.filter(models.Section.course_id == course_id)
    if status_ is not None and hasattr(models.Section, "status"):
        q = q.filter(models.Section.status == status_)
    return q.offset(skip).limit(limit).all()

def get_section(db: Session, section_id: int) -> models.Section | None:
    q = db.query(models.Section).filter(models.Section.id == section_id)
    q = _maybe_not_deleted(q)
    return q.first()

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
    _maybe_check_section_number_unique(db, data["course_id"], data.get("section_number"))

    sec = models.Section(**data)
    # Default status if the column exists and not provided
    if hasattr(sec, "status") and getattr(sec, "status", None) is None:
        try:
            # Enum on the model if present
            from app.db.models import SectionStatus as _SectionStatus  # type: ignore
            sec.status = _SectionStatus.open  # type: ignore[attr-defined]
        except Exception:
            pass

    db.add(sec)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Let the route translate constraint names into messages
        raise
    db.refresh(sec)
    return sec

def update_section(
    db: Session, section_id: int, payload: schemas.SectionUpdate
) -> models.Section | None:
    _sec = get_section(db, section_id)
    if not _sec:
        return None

    sec: models.Section = _sec
    changes = payload.model_dump(exclude_unset=True)

    # Apply changes first (so validations run on new values)
    for k, v in changes.items():
        setattr(sec, k, v)

    # Validate updated FKs if present
    if "course_id" in changes:
        _require_fk(db, models.Course,      cast(int, sec.course_id),       "Course")
    if "instructor_id" in changes:
        _require_fk(db, models.Instructor,  cast(int, sec.instructor_id),   "Instructor")
    if "room_id" in changes:
        _require_fk(db, models.Room,        cast(int, sec.room_id),         "Room")
    if "meeting_time_id" in changes:
        _require_fk(db, models.MeetingTime, cast(int, sec.meeting_time_id), "MeetingTime")

    # Re-check business rules on new state
    _check_conflicts(
        db,
        instructor_id=cast(int, sec.instructor_id),
        room_id=cast(int, sec.room_id),
        meeting_time_id=cast(int, sec.meeting_time_id),
        section_id_to_exclude=cast(int, sec.id),
    )
    _check_capacity(db, cast(int, sec.room_id), cast(int | None, sec.seats))
    _maybe_check_section_number_unique(
        db, cast(int, sec.course_id), cast(str | None, getattr(sec, "section_number", None)), exclude_id=cast(int, sec.id)
    )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Let the route translate constraint names into messages
        raise
    db.refresh(sec)
    return sec

def delete_section(db: Session, section_id: int) -> models.Section | None:
    sec = get_section(db, section_id)
    if not sec:
        return None

    # Soft delete if that column exists on the model (your migration added it)
    if hasattr(models.Section, "deleted_at"):
        sec.deleted_at = datetime.now(timezone.utc)
        db.add(sec)
    else:
        db.delete(sec)

    db.commit()
    return sec

