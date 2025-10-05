from sqlalchemy.orm import Session
from app.db import models
from fastapi import HTTPException

def get_conflicts(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Conflict).offset(skip).limit(limit).all()

def get_conflicts_by_section(db: Session, section_id: int):
    # Make sure the section exists
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail=f"Section with id '{section_id}' not found")
    return db.query(models.Conflict).filter(models.Conflict.section_id == section_id).all()

def clear_conflicts_for_section(db: Session, section_id: int):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail=f"Section with id '{section_id}' not found")
    
    deleted_count = db.query(models.Conflict).filter(models.Conflict.section_id == section_id).delete()
    db.commit()

    return deleted_count
