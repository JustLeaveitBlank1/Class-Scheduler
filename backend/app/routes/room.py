# app/routes/room.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

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

def _map_room_integrity(e: IntegrityError) -> str:
    txt = str(getattr(e, "orig", e))
    if "room_number" in txt:
        return "A room with that room number already exists."
    return "Unique constraint violated."

@router.get("/", response_model=List[schemas.RoomRead])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return room_crud.get_rooms(db, skip=skip, limit=limit)

@router.get("/{room_id}", response_model=schemas.RoomRead)
def read_room(room_id: int, db: Session = Depends(get_db)):
    db_room = room_crud.get_room(db, room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room

@router.post("/", response_model=schemas.RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(payload: schemas.RoomCreate, response: Response, db: Session = Depends(get_db)):
    try:
        room = room_crud.create_room(db, payload)
        response.headers["Location"] = f"/rooms/{room.id}"
        return room
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        # use 409 for duplicate room_number
        raise HTTPException(status_code=409, detail=_map_room_integrity(e))

@router.put("/{room_id}", response_model=schemas.RoomRead)
def update_room(room_id: int, payload: schemas.RoomUpdate, db: Session = Depends(get_db)):
    try:
        db_room = room_crud.update_room(db, payload, room_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        raise HTTPException(status_code=409, detail=_map_room_integrity(e))
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    # ✅ correct order: (db, room_id)
    deleted = room_crud.delete_room(db, room_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Room not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
