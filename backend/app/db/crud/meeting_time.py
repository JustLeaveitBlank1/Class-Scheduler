from sqlalchemy.orm import Session
from app.db import models, schemas
from fastapi import HTTPException

def get_meeting_times(db: Session, skip: int=0, limit: int=100):
    return db.query(models.MeetingTime).offset(skip).limit(limit).all()

def get_meeting_time(db: Session, meeting_time_id: int):
    mt = db.query(models.MeetingTime).filter(models.MeetingTime.id == meeting_time_id).first()
    if not mt:
        raise HTTPException(status_code=404, detail=f"Meeting Time with id '{meeting_time_id}' not found")
    return mt

def create_meeting_time(db: Session, meeting_time: schemas.MeetingTimeCreate):
    # Check for duplicate (same day, start, and end)
    existing = (
        db.query(models.MeetingTime)
        .filter(
            models.MeetingTime.day_of_week == meeting_time.day_of_week,
            models.MeetingTime.start_time == meeting_time.start_time,
            models.MeetingTime.end_time == meeting_time.end_time,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Meeting Time '{meeting_time.day_of_week} {meeting_time.start_time}-{meeting_time.end_time}' already exists"
        )

    db_mt = models.MeetingTime(**meeting_time.model_dump())
    db.add(db_mt)
    db.commit()
    db.refresh(db_mt)
    return db_mt

def update_meeting_time(db: Session, meeting_time_id: int, meeting_time: schemas.MeetingTimeUpdate):
    db_mt = get_meeting_time(db, meeting_time_id) # raises 404 if not found

    # Prevent duplicates if updating
    if meeting_time.day_of_week or meeting_time.start_time or meeting_time.end_time:
        new_day = meeting_time.day_of_week or db_mt.day_of_week
        new_start = meeting_time.start_time or db_mt.start_time
        new_end = meeting_time.end_time or db_mt.end_time

        existing = (
            db.query(models.MeetingTime)
            .filter(
                models.MeetingTime.day_of_week == new_day,
                models.MeetingTime.start_time == new_start,
                models.MeetingTime.end_time == new_end,
                models.MeetingTime.id != meeting_time_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Meeting Time '{new_day} {new_start}-{new_end}' already exists"
            )
    
    for key, value in meeting_time.model_dump(exclude_unset=True).items():
        setattr(db_mt, key, value)
    
    db.commit()
    db.refresh(db_mt)
    return db_mt

def delete_meeting_time(db: Session, meeting_time_id: int):
    db_mt = get_meeting_time(db, meeting_time_id) # raises 404 if not found
    db.delete(db_mt)
    db.commit()
    return db_mt
