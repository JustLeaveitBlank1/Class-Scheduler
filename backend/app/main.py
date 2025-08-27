from fastapi import FastAPI
from app.api import courses, instructors, assignments

app = FastAPI()

app.include_router(courses.router)
app.include_router(instructors.router)
app.include_router(assignments.router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
