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
    Example: /sections/calendar/events?resource=room&ids=10&ids=11
    """
    q = (
        db.query(models.Section)
        .join(models.Course)
        .join(models.Instructor)
        .join(models.Room)
        .join(models.MeetingTime)
    )
    if resource == "room" and ids:
        q = q.filter(models.Section.room_id.in__(ids))
    if resource == "instructor" and ids:
        q = q.filter(models.Section.instructor_id.in__(ids))

    items: List[dict] = []
    for s in q.all():
        mt = s.meeting_time
        room_label = getattr(s.room, "room_number", None) or getattr(s.room, "name", "")
        items.append(
            {
                "id": s.id,
                "title": f"{s.course.code} - {getattr(s.course, 'name', '')}".strip(" -"),
                "sub": f"{s.instructor.name} • {room_label}",
                "resource": f"{resource}:{getattr(s, resource).id}",
                "day_of_week": mt.day_of_week,      # e.g., "Tue" / "Tuesday"
                "start_time": str(mt.start_time),   # "11:00:00"
                "end_time": str(mt.end_time),       # "12:15:00"
                "seats": s.seats,
            }
        )
    return items


# ---------- CRUD endpoints ----------

@router.get("/", response_model=list[schemas.SectionRead])
def list_sections(
    skip: int = 0,
    limit: int = 100,
    instructor_id: int | None = None,
    room_id: int | None = None,
    db: Session = Depends(get_db),
):
    # Keep in sync with your CRUD signature
    return crud.list_sections(
        db,
        skip=skip,
        limit=limit,
        instructor_id=instructor_id,
        room_id=room_id,
    )


@router.get("/{section_id}", response_model=schemas.SectionRead)
def get_section(section_id: int, db: Session = Depends(get_db)):
    sec = crud.get_section(db, section_id)
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    return sec


def _map_integrity_error_to_msg(e: IntegrityError) -> str:
    """
    Robustly extract the violated constraint name from psycopg2/psycopg error,
    falling back to string parsing if diagnostics aren't available.
    """
    constraint: Optional[str] = None
    # psycopg2 puts details on .orig.diag.constraint_name when available
    orig = getattr(e, "orig", None)
    if orig is not None:
        diag = getattr(orig, "diag", None)
        if diag is not None:
            constraint = getattr(diag, "constraint_name", None)

    # Fallback: parse the stringified error for known constraint names
    if not constraint:
        text = str(orig or e)
        if "uq_sections_room_time" in text:
            constraint = "uq_sections_room_time"
        elif "uq_sections_instructor_time" in text:
            constraint = "uq_sections_instructor_time"

    if constraint == "uq_sections_room_time":
        return "Room is already scheduled at that meeting time."
    if constraint == "uq_sections_instructor_time":
        return "Instructor is already scheduled at that meeting time."
    return "Unique constraint violated."


def _map_value_error_to_http(e: ValueError) -> HTTPException:
    msg = str(e)
    low = msg.lower()
    if (
        "does not exist" in low
        or "non-negative" in low
        or "exceed room capacity" in low
    ):
        return HTTPException(status_code=400, detail=msg)
    return HTTPException(status_code=409, detail=msg)


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
