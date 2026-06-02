# app/routes/section.py
from typing import Literal, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import SessionLocal
from app.db import schemas, models
from app.db.crud import section as crud

router = APIRouter(prefix="/sections", tags=["Sections"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Calendar-friendly endpoint (put BEFORE "/{section_id}") ----------
@router.get("/calendar/events")
def calendar_events(
    resource: Literal["room", "instructor"] = Query(
        "room", description="Group by 'room' or 'instructor'"
    ),
    ids: Optional[List[int]] = Query(
        None, description="Repeat ?ids=10&ids=11 to filter multiple"
    ),
    db: Session = Depends(get_db),
):
    """
    Returns simple calendar events for the selected resource(s).

    NOTE: After the schema change, sections now have free-form start/end times
    and credits (no MeetingTime table). This endpoint returns those fields.
    Example: /sections/calendar/events?resource=room&ids=10&ids=11
    """
    q = (
        db.query(models.Section)
        .join(models.Course)
        .join(models.Instructor)
        .join(models.Room)
    )

    if resource == "room" and ids:
        q = q.filter(models.Section.room_id.in_(ids))
    if resource == "instructor" and ids:
        q = q.filter(models.Section.instructor_id.in_(ids))

    items: List[dict] = []
    for s in q.all():
        room_label = getattr(s.room, "room_number", None) or getattr(s.room, "name", "")
        items.append(
            {
                "id": s.id,
                "title": f"{s.course.code} - {getattr(s.course, 'name', '')}".strip(" -"),
                "sub": f"{s.instructor.name} • {room_label}",
                "resource": f"{resource}:{getattr(s, resource).id}",
                # We no longer have MeetingTime; we expose the raw start/end and credits.
                "day_of_week": "",  # placeholder for future expansion
                "start_time": str(s.start),  # e.g. "09:30:00"
                "end_time": str(s.end),      # e.g. "10:45:00"
                "credits": s.credits,
            }
        )
    return items


# ---------- helpers ----------

def _map_integrity_error_to_msg(e: IntegrityError) -> str:
    """
    Extract a friendly message from a unique-constraint IntegrityError.
    Tries psycopg diag first; falls back to string matching.
    """
    constraint = None
    orig = getattr(e, "orig", None)
    if orig is not None:
        diag = getattr(orig, "diag", None)
        if diag is not None:
            constraint = getattr(diag, "constraint_name", None)

    if not constraint:
        text = str(orig or e)
        # Match both current and older constraint names
        for name in (
            "uq_room_start_end",          # new
            "uq_instructor_start_end",    # new
            "uq_room_time",               # legacy
            "uq_instructor_time",         # legacy
            "uq_course_section_number",
            "uq_sections_room_time",
            "uq_sections_instructor_time",
        ):
            if name in text:
                constraint = name
                break

    if constraint in ("uq_room_start_end", "uq_room_time", "uq_sections_room_time"):
        return "Room is already scheduled at that time."
    if constraint in ("uq_instructor_start_end", "uq_instructor_time", "uq_sections_instructor_time"):
        return "Instructor is already scheduled at that time."
    if constraint == "uq_course_section_number":
        return "This course already has that section number."
    return "Unique constraint violated."


def _map_value_error_to_http(e: ValueError) -> HTTPException:
    msg = str(e)
    low = msg.lower()
    if (
        "does not exist" in low
        or "non-negative" in low
        or "exceed room capacity" in low
        or "already booked" in low
        or "already scheduled" in low
        or "section number" in low
    ):
        return HTTPException(status_code=400, detail=msg)
    return HTTPException(status_code=409, detail=msg)


# ---------- CRUD endpoints ----------

@router.get("/", response_model=list[schemas.SectionRead])
def list_sections(
    skip: int = 0,
    limit: int = 100,
    instructor_id: int | None = None,
    room_id: int | None = None,
    course_id: int | None = None,
    status_: schemas.SectionStatus | None = Query(default=None, alias="status"),
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    return crud.list_sections(
        db,
        skip=skip,
        limit=limit,
        instructor_id=instructor_id,
        room_id=room_id,
        course_id=course_id,
        status_=status_,
        include_deleted=include_deleted,
    )


@router.get("/{section_id}", response_model=schemas.SectionRead)
def get_section(section_id: int, db: Session = Depends(get_db)):
    sec = crud.get_section(db, section_id)
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    return sec


@router.post("/", response_model=schemas.SectionRead, status_code=status.HTTP_201_CREATED)
def create_section(
    payload: schemas.SectionCreate,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        sec = crud.create_section(db, payload)
        response.headers["Location"] = f"/sections/{sec.id}"
        return sec
    except ValueError as e:
        raise _map_value_error_to_http(e)
    except IntegrityError as e:
        db.rollback()
        msg = _map_integrity_error_to_msg(e)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.put("/{section_id}", response_model=schemas.SectionRead)
def update_section(
    section_id: int,
    payload: schemas.SectionUpdate,
    db: Session = Depends(get_db),
):
    try:
        sec = crud.update_section(db, section_id, payload)
        if not sec:
            raise HTTPException(status_code=404, detail="Section not found")
        return sec
    except ValueError as e:
        raise _map_value_error_to_http(e)
    except IntegrityError as e:
        db.rollback()
        msg = _map_integrity_error_to_msg(e)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_section(db, section_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Section not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
