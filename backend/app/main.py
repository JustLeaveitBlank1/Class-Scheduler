from fastapi import FastAPI
from app.api import courses, instructors, assignments
from datetime import datetime
from sqlalchemy import text
from app.db.database import SessionLocal

app = FastAPI()

app.include_router(courses.router)
app.include_router(instructors.router)
app.include_router(assignments.router)

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
