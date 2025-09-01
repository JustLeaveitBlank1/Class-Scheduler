from app.db.database import Base, engine, SessionLocal
from app.db import models

def reset_database():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

def seed_database():
    print("Seeding database with test data...")
    db = SessionLocal()
    try:
        # Sample instructors
        instr1 = models.Instructor(
            name="John Smith",
            email="john.smith@example.edu",
            department="MATH",
            max_load=15
            )
        instr2 = models.Instructor(
            name="Will Johnson",
            email="will.johnson@example.edu",
            department="CMPS",
            max_load=15
            )

        # Sample rooms
        room1 = models.Room(name="PH211", capacity=30)
        room2 = models.Room(name="SBA234", capacity=25, constraints="no power")

        # Sample meeting times
        mt1 = models.MeetingTime(day_of_week="M/W", start_time="09:30", end_time="10:45")
        mt2 = models.MeetingTime(day_of_week="T/Th", start_time="12:30", end_time="13:45")

        # Sample courses
        course1 = models.Course(
            code="CH1010",
            name="CHEM 1010",
            credit_hours=3,
            contact_hours=3
            )
        course2 = models.Course(
            code="PH2010",
            name="PHYS 2010",
            credit_hours=4,
            contact_hours=5
            )

        # Add and commit
        db.add_all([instr1, instr2, room1, room2, mt1, mt2, course1, course2])
        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
    seed_database()
