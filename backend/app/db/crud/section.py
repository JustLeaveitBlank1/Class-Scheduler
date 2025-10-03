from sqlalchemy.orm import Session
from app.db import models, schemas
from app.services.conflicts import check_conflicts
from app.db.crud import conflict as conflict_crud

def get_sections(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Section).offset(skip).limit(limit).all()

def get_section(db: Session, section_id: int):
    return db.query(models.Section).filter(models.Section.id == section_id).first()

def create_section(db: Session, section: schemas.SectionCreate):
    db_section = models.Section(**section.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)

    conflict_crud.clear_conflicts_for_section(db, int(db_section.id)) # type: ignore
    check_conflicts(db, db_section)

    return db_section

def update_section(db: Session, section_id: int, section: schemas.SectionUpdate):
    db_section = get_section(db, section_id)
    if not db_section:
        return None
    for key, value in section.model_dump().items():
        setattr(db_section, key, value)

    db.commit()
    db.refresh(db_section)

    conflict_crud.clear_conflicts_for_section(db, int(db_section.id)) # type: ignore
    check_conflicts(db, db_section)

    return db_section

def delete_section(db: Session, section_id: int):
    db_section = get_section(db, section_id)
    if not db_section:
        return None
    
    conflict_crud.clear_conflicts_for_section(db, int(db_section.id)) # type: ignore

    db.delete(db_section)
    db.commit()

    return db_section
