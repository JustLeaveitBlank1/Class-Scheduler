from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import schemas
from app.db.crud import room as room_crud

router = APIRouter(prefix="/rooms", tags=["Rooms"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.RoomRead])
def read_rooms(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return room_crud.get_rooms(db, skip=skip, limit=limit)

@router.get("/{room_id}", response_model=schemas.RoomRead)
def read_room(room_id: int, db: Session=Depends(get_db)):
    db_room = room_crud.get_room(db, room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room

@router.post("/", response_model=schemas.RoomRead)
def create_room(room: schemas.RoomCreate, db: Session=Depends(get_db)):
    return room_crud.create_room(db, room)

@router.put("/{room_id}", response_model=schemas.RoomRead)
def update_room(room_id: int, room: schemas.RoomUpdate, db: Session=Depends(get_db)):
    db_room = room_crud.update_room(db, room_id, room)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room

@router.delete("/{room_id}", response_model=schemas.RoomRead)
def delete_room(room_id: int, db: Session=Depends(get_db)):
    db_room = room_crud.delete_room(db, room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room
