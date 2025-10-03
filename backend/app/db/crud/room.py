from sqlalchemy.orm import Session
from app.db import models, schemas
from fastapi import HTTPException

def get_rooms(db: Session, skip: int=0, limit: int=100):
    return db.query(models.Room).offset(skip).limit(limit).all()

def get_room(db: Session, room_id: int):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room with id '{room_id}' not found")
    return room

def create_room(db: Session, room: schemas.RoomCreate):
    # Check for duplicate name
    existing = db.query(models.Room).filter(models.Room.name == room.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Room with name '{room.name}' already exists")
    
    if room.capacity <= 0:
        raise HTTPException(status_code=400, detail=f"Room capacity must be a positive number ({room.capacity} > 0)")

    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room(db: Session, room_id: int, room: schemas.RoomUpdate):
    db_room = get_room(db, room_id) # will raise 404 if not found

    # Check for duplicate name if updating
    if room.name:
        existing = (
            db.query(models.Room)
            .filter(models.Room.name == room.name, models.Room.id != room_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail=f"Room name '{room.name}' is already in use")
        
    if room.capacity is not None and room.capacity <= 0:
        raise HTTPException(status_code=400, detail=f"Room capacity must be a positive number ({room.capacity} > 0)")
    
    for key, value in room.model_dump(exclude_unset=True).items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room

def delete_room(db: Session, room_id: int):
    db_room = get_room(db, room_id) # will raise 404 if not found
    db.delete(db_room)
    db.commit()
    return db_room
