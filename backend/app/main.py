from fastapi import FastAPI
from datetime import datetime
from sqlalchemy import text
from app.db.database import SessionLocal
from app.routes import course, instructor, meeting_time, room, section, conflict

app = FastAPI()

app.include_router(course.router)
app.include_router(instructor.router)
app.include_router(meeting_time.router)
app.include_router(room.router)
app.include_router(section.router)
app.include_router(conflict.router)

# Home
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    db_status = "unknown"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    finally:
        db.close()
        
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat() + "Z",
        "database": db_status
    }
