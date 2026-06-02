# app/main.py
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.database import SessionLocal
from app.routes import course, instructor, room, section
from app.routes import auth as auth_router
from app.routes import users as users_router

app = FastAPI(title="Schedule Calendar", version="0.1.0")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,   # not "*"
    allow_credentials=True,          # for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers ----
app.include_router(auth_router.router)   # /auth/...
app.include_router(users_router.router)  # /users/...
app.include_router(course.router)        # /courses/...
app.include_router(instructor.router)    # /instructors/...
# app.include_router(meeting_time.router)  # ❌ removed, we don't use meeting_times anymore
app.include_router(room.router)         # /rooms/...
app.include_router(section.router)      # /sections/...

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/health", tags=["Health"])
def health_check():
    db_status = "unknown"
    try:
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
