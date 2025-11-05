# app/main.py
from fastapi import FastAPI
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.routes import course, instructor, meeting_time, room, section

app = FastAPI(title="Schedule Calendar", version="0.1.0")

app.include_router(course.router)
app.include_router(instructor.router)
app.include_router(meeting_time.router)
app.include_router(room.router)       # <-- add Rooms
app.include_router(section.router)    # <-- add Sections

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/health", tags=["Health"])
def health_check():
    db_status = "unknown"
    try:
        # SQLAlchemy 2.x Session supports context manager
        with SessionLocal() as db:  
            db.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat() + "Z",
        "database": db_status,
    }
