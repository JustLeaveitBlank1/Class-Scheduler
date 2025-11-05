from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import meeting_time as mt_crud

router = APIRouter(prefix="/meeting-times", tags=["Meeting Times"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.MeetingTimeRead])
def read_meeting_times(
    skip: int = 0,
    limit: int = 100,
    # Accept repeated ids (?ids=1&ids=2) or a single comma-separated value (?ids=1,2)
    ids: list[str] | None = Query(
        default=None,
        description="Filter by IDs. Use ?ids=1&ids=2 or ?ids=1,2",
    ),
    db: Session = Depends(get_db),
):
    ids_list: list[int] | None = None
    if ids:
        flat: list[int] = []
        for v in ids:
            for part in str(v).split(","):
                part = part.strip()
                if part:
                    flat.append(int(part))
        ids_list = flat or None

    return mt_crud.get_meeting_times(db, skip=skip, limit=limit, ids=ids_list)

@router.get("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def read_meeting_time(meeting_time_id: int, db: Session = Depends(get_db)):
    db_mt = mt_crud.get_meeting_time(db, meeting_time_id)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt

@router.post("/", response_model=schemas.MeetingTimeRead)
def create_meeting_time(meeting_time: schemas.MeetingTimeCreate, db: Session = Depends(get_db)):
    return mt_crud.create_meeting_time(db, meeting_time)

@router.put("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def update_meeting_time(meeting_time_id: int, meeting_time: schemas.MeetingTimeUpdate, db: Session = Depends(get_db)):
    db_mt = mt_crud.update_meeting_time(db, meeting_time_id, meeting_time)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt

@router.delete("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def delete_meeting_time(meeting_time_id: int, db: Session = Depends(get_db)):
    db_mt = mt_crud.delete_meeting_time(db, meeting_time_id)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt
