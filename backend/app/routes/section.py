from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db import models
from app.db.crud import section as section_crud
from datetime import datetime

def parse_time(tstr: str):
    # Convert a 'HH:MM' 24-hour string to a time object
    return datetime.strptime(tstr, "%H:%M").time()

def times_overlap(start1, end1, start2, end2):
    s1, e1, s2, e2 = map(parse_time, (start1, end1, start2, end2))
    return s1 < e2 and s2 < e1

router = APIRouter(prefix="/sections", tags=["Sections"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.SectionRead])
def read_sections(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return section_crud.get_sections(db, skip=skip, limit=limit)

@router.get("/{section_id}", response_model=schemas.SectionRead)
def read_section(section_id: int, db: Session=Depends(get_db)):
    db_section = section_crud.get_section(db, section_id)
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section

@router.post("/", response_model=schemas.SectionRead)
def create_section(section: schemas.SectionCreate, db: Session=Depends(get_db)):
    return section_crud.create_section(db, section)

@router.put("/{section_id}", response_model=schemas.SectionRead)
def update_section(section_id: int, section: schemas.SectionUpdate, db: Session=Depends(get_db)):
    db_section = section_crud.update_section(db, section_id, section)
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section

@router.delete("/{section_id}", response_model=schemas.SectionRead)
def delete_section(section_id: int, db: Session=Depends(get_db)):
    db_section = section_crud.delete_section(db, section_id)
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    return db_section
