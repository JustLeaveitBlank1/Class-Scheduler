from typing import Optional, List
from sqlalchemy.orm import Session
from app.db import models, schemas

def get_meeting_times(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    ids: Optional[List[int]] = None,
):
    q = db.query(models.MeetingTime)
    if ids:
        q = q.filter(models.MeetingTime.id.in_(ids))
    return q.offset(skip).limit(limit).all()

def get_meeting_time(db: Session, meeting_time_id: int):
    return db.query(models.MeetingTime).filter(models.MeetingTime.id == meeting_time_id).first()

def create_meeting_time(db: Session, meeting_time: schemas.MeetingTimeCreate):
    db_mt = models.MeetingTime(**meeting_time.model_dump())
    db.add(db_mt)
    db.commit()
    db.refresh(db_mt)
    return db_mt

def update_meeting_time(db: Session, meeting_time_id: int, meeting_time: schemas.MeetingTimeUpdate):
    db_mt = get_meeting_time(db, meeting_time_id)
    if not db_mt:
        return None
    # only apply fields the client actually sent
    for key, value in meeting_time.model_dump(exclude_unset=True).items():
        setattr(db_mt, key, value)
    db.commit()
    db.refresh(db_mt)
    return db_mt

def delete_meeting_time(db: Session, meeting_time_id: int):
    db_mt = get_meeting_time(db, meeting_time_id)
    if not db_mt:
        return None
    db.delete(db_mt)
    db.commit()
    return db_mt
