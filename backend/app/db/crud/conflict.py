from sqlalchemy.orm import Session
from app.db import models

def get_conflicts(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Conflict).offset(skip).limit(limit).all()

def get_conflicts_by_section(db: Session, section_id: int):
    return db.query(models.Conflict).filter(models.Conflict.section_id == section_id).all()

def clear_conflicts_for_section(db: Session, section_id: int):
    db.query(models.Conflict).filter(models.Conflict.section_id == section_id).delete()
    db.commit()
