# app/db/crud/room.py
from __future__ import annotations

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db import models, schemas


# -------- helpers --------
def _normalize_room_number(value: str) -> str:
    # Trim and collapse internal whitespace (e.g., "CSB  210" -> "CSB 210")
    return " ".join(value.split())


# -------- reads --------
def get_rooms(db: Session, skip: int = 0, limit: int = 100) -> List[models.Room]:
    return db.query(models.Room).offset(skip).limit(limit).all()


def get_room(db: Session, room_id: int) -> Optional[models.Room]:
    return db.query(models.Room).filter(models.Room.id == room_id).first()


def get_room_by_number(db: Session, room_number: str) -> Optional[models.Room]:
    rn = _normalize_room_number(room_number)
    return db.query(models.Room).filter(models.Room.room_number == rn).first()


# -------- create --------
def create_room(db: Session, payload: schemas.RoomCreate) -> models.Room:
    data = payload.model_dump()
    # normalize + validate
    data["room_number"] = _normalize_room_number(data["room_number"])
    if data["capacity"] < 0:
        raise ValueError("Capacity must be a non-negative integer.")

    room = models.Room(**data)
    db.add(room)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Let router translate this to 409 with a friendly message
        raise
    db.refresh(room)
    return room


# -------- update --------
def update_room(db: Session, room: schemas.RoomUpdate, room_id: int) -> Optional[models.Room]:
    db_room = get_room(db, room_id)
    if not db_room:
        return None

    changes = room.model_dump(exclude_unset=True)

    if "room_number" in changes and changes["room_number"] is not None:
        changes["room_number"] = _normalize_room_number(changes["room_number"])

    if "capacity" in changes and changes["capacity"] is not None:
        if changes["capacity"] < 0:
            raise ValueError("Capacity must be a non-negative integer.")

    for k, v in changes.items():
        setattr(db_room, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Let router translate this to 409 with a friendly message
        raise
    db.refresh(db_room)
    return db_room


# -------- delete --------
def delete_room(db: Session, room_id: int) -> Optional[models.Room]:
    db_room = get_room(db, room_id)
    if not db_room:
        return None
    db.delete(db_room)
    db.commit()
    return db_room
