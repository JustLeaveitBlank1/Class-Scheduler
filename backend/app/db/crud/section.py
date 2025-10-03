from sqlalchemy.orm import Session
from app.db import models, schemas
from app.services.conflicts import check_conflicts
from app.db.crud import conflict as conflict_crud
from app.services.utils import recalc_instructor_load
from fastapi import HTTPException

def get_sections(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Section).offset(skip).limit(limit).all()

def get_section(db: Session, section_id: int):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail=f"Section with id '{section_id}' not found")
    return section

def create_section(db: Session, section: schemas.SectionCreate):
    db_section = models.Section(**section.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)

    # Always recalc loads from scratch
    recalc_instructor_load(db, db_section.instructor_id)

    # Conflicts
    conflict_crud.clear_conflicts_for_section(db, db_section.id)
    check_conflicts(db, db_section)

    return db_section

def update_section(db: Session, section_id: int, section: schemas.SectionUpdate):
    db_section = get_section(db, section_id) # raises 404 if missing
    
    for key, value in section.model_dump(exclude_unset=True).items():
        setattr(db_section, key, value)

    db.commit()
    db.refresh(db_section)

    # Recalc load for instructor
    recalc_instructor_load(db, db_section.instructor_id)

    # Conflicts
    conflict_crud.clear_conflicts_for_section(db, db_section.id)
    check_conflicts(db, db_section)

    return db_section

def delete_section(db: Session, section_id: int):
    db_section = get_section(db, section_id) # raises 404 if missing
    instructor_id = db_section.instructor_id

    conflict_crud.clear_conflicts_for_section(db, db_section.id)
    db.delete(db_section)
    db.commit()

    # Recalc load after removal
    recalc_instructor_load(db, instructor_id)

    return db_section
