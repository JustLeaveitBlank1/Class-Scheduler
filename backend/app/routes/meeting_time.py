from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import meeting_time as mt_crud

router = APIRouter(prefix="/assignments", tags=["Assignments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.get("/", response_model=list[schemas.MeetingTimeRead])
def read_meeting_times(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return mt_crud.get_meeting_times(db, skip=skip, limit=limit)

@router.get("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def read_meeting_time(meeting_time_id: int, db: Session=Depends(get_db)):
    db_mt = mt_crud.get_meeting_time(db, meeting_time_id)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt

@router.post("/", response_model=schemas.MeetingTimeRead)
def create_meeting_time(meeting_time: schemas.MeetingTimeCreate, db: Session=Depends(get_db)):
    return mt_crud.create_meeting_time(db, meeting_time)

@router.put("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def update_meeting_time(meeting_time_id: int, meeting_time: schemas.MeetingTimeUpdate, db: Session=Depends(get_db)):
    db_mt = mt_crud.update_meeting_time(db, meeting_time_id, meeting_time)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt

@router.delete("/{meeting_time_id}", response_model=schemas.MeetingTimeRead)
def delete_meeting_time(meeting_time_id: int, db: Session=Depends(get_db)):
    db_mt = mt_crud.delete_meeting_time(db, meeting_time_id)
    if not db_mt:
        raise HTTPException(status_code=404, detail="Meeting time not found")
    return db_mt
