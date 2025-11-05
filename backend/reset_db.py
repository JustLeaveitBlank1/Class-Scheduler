# reset_db.py  (run from backend/)
from dotenv import load_dotenv
load_dotenv()  # make sure DATABASE_URL from .env is available

from sqlalchemy import text
from app.db.database import Base, engine, SessionLocal
from app.db import models  # ensure models are imported so Base knows all tables


def reset_database() -> None:
    """
    Hard reset of the Postgres schema for local dev:
    1) DROP SCHEMA public CASCADE   -> removes all tables, FKs, etc.
    2) CREATE SCHEMA public         -> clean slate
    3) Base.metadata.create_all()   -> recreate tables from current models
    """
    print("Dropping and recreating schema 'public' (CASCADE)...")
    # DDL needs autocommit on Postgres
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))

    print("Creating tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")


def seed_database() -> None:
    """
    Insert a small, valid set of demo rows.
    NOTE: Field names align with your Pydantic/SQLAlchemy models:
      - Instructor: name, email, current_load, department
      - Room: room_number, capacity
      - MeetingTime: day_of_week, start_time, end_time
      - Course: code, name, credit_hours, contact_hours
    """
    print("Seeding database with test data...")
    db = SessionLocal()
    try:
        # Instructors
        instr1 = models.Instructor(
            name="John Smith",
            email="john.smith@example.edu",
            department="MATH",
            current_load=0,
        )
        instr2 = models.Instructor(
            name="Will Johnson",
            email="will.johnson@example.edu",
            department="CMPS",
            current_load=0,
        )

        # Rooms
        room1 = models.Room(room_number="PH211", capacity=30)
        room2 = models.Room(room_number="SBA234", capacity=25)

        # Meeting times
        mt1 = models.MeetingTime(day_of_week="M/W", start_time="09:30", end_time="10:45")
        mt2 = models.MeetingTime(day_of_week="T/Th", start_time="12:30", end_time="13:45")

        # Courses
        course1 = models.Course(
            code="CH1010", name="CHEM 1010", credit_hours=3, contact_hours=3
        )
        course2 = models.Course(
            code="PH2010", name="PHYS 2010", credit_hours=4, contact_hours=5
        )

        db.add_all([instr1, instr2, room1, room2, mt1, mt2, course1, course2])
        db.commit()
        print("✅ Database seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    reset_database()
    seed_database()  # comment out if you prefer starting empty
