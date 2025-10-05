# backend/reset_db.py
from sqlalchemy import text
from app.db.database import Base, engine, SessionLocal
from app.db import models
from app.services.utils import recalc_instructor_load

def reset_database():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

def seed_database():
    print("Seeding database with test data...")
    db = SessionLocal()
    i = 1
    max_i = 9
    try:
        i = load_bar(i, max_i)
        # -------- Instructors --------
        instructors = [
            models.Instructor(name="Dr. Alice Nguyen",  email="alice.nguyen@example.edu",  department="CMPS", max_load=12),
            models.Instructor(name="Prof. Ben Ortega",  email="ben.ortega@example.edu",   department="CMPS", max_load=9),
            models.Instructor(name="Dr. Carla Singh",   email="carla.singh@example.edu",  department="CMPS", max_load=12),
            models.Instructor(name="Prof. Devin Cho",   email="devin.cho@example.edu",    department="MATH", max_load=6),
            models.Instructor(name="Dr. Elena Park",    email="elena.park@example.edu",   department="PHYS", max_load=12),
        ]

        i = load_bar(i, max_i)
        # -------- Rooms --------
        rooms = [
            models.Room(name="SCI 101",  capacity=28),
            models.Room(name="SCI 202",  capacity=40),
            models.Room(name="TECH 12",  capacity=24),
            models.Room(name="TECH 18",  capacity=50),
            models.Room(name="PH 211",   capacity=30),
        ]

        i = load_bar(i, max_i)
        # -------- Courses --------
        courses = [
            models.Course(code="CS101", name="Intro to Programming", credit_hours=3, contact_hours=3),
            models.Course(code="CS141", name="Discrete Structures",  credit_hours=3, contact_hours=3),
            models.Course(code="CS220", name="Data Structures",      credit_hours=4, contact_hours=4),
            models.Course(code="CS311", name="Operating Systems",    credit_hours=3, contact_hours=3),
            models.Course(code="CS411", name="Software Engineering", credit_hours=3, contact_hours=3),
        ]

        i = load_bar(i, max_i)
        # -------- Meeting Times --------
        mtimes = [
            models.MeetingTime(day_of_week="MWF", start_time="09:00", end_time="09:50"),
            models.MeetingTime(day_of_week="MWF", start_time="10:00", end_time="10:50"),
            models.MeetingTime(day_of_week="MWF", start_time="11:00", end_time="11:50"),
            models.MeetingTime(day_of_week="TR",  start_time="09:30", end_time="10:45"),
            models.MeetingTime(day_of_week="TR",  start_time="14:00", end_time="15:15"),
        ]

        db.add_all(instructors + rooms + courses + mtimes)
        db.commit()

        i = load_bar(i, max_i)
        # -------- ID maps for joins (these MUST be defined before the loop) --------
        inst_ids = {i.name: i.id for i in db.query(models.Instructor).all()}
        room_ids = {r.name: r.id for r in db.query(models.Room).all()}
        crs_ids  = {c.code: c.id for c in db.query(models.Course).all()}
        mt_ids   = {(m.day_of_week, m.start_time, m.end_time): m.id
                    for m in db.query(models.MeetingTime).all()}

        i = load_bar(i, max_i)
        # -------- 5 Sections (course ↔ instructor ↔ room ↔ meeting_time) --------
        sections = [
            # (course_code, instructor_name,   room_name,  (day,  start,  end))
            ("CS101",      "Dr. Alice Nguyen","SCI 101",  ("MWF","09:00","09:50")),
            ("CS141",      "Prof. Ben Ortega","TECH 12",  ("TR", "09:30","10:45")),
            ("CS220",      "Dr. Carla Singh", "TECH 18",  ("TR", "14:00","15:15")),
            ("CS311",      "Dr. Elena Park",  "SCI 202",  ("MWF","11:00","11:50")),
            ("CS411",      "Prof. Devin Cho", "PH 211",   ("MWF","10:00","10:50")),
        ]

        i = load_bar(i, max_i)
        for code, iname, rname, (d, st, en) in sections:
            db.add(models.Section(
                course_id       = crs_ids[code],
                instructor_id   = inst_ids[iname],
                room_id         = room_ids[rname],
                meeting_time_id = mt_ids[(d, st, en)],
            ))

        db.commit()

        i = load_bar(i, max_i)
        for inst in db.query(models.Instructor).all():
            recalc_instructor_load(db, inst.id)
        
        load_bar(i, max_i)

        db.commit()
        print("Database seeded successfully!")

        # -------- KEEP FOR NOW --------
        # Optional counts (SQLAlchemy 2.0 needs text())
        for t in ("instructors","rooms","courses","meeting_times","sections"):
            n = db.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar()
            print(f"  {t}: {n}")

    finally:
        db.close()

def load_bar(i, max_i):
    p = "="
    w = " "
    print(f"[{p*i}{w*(max_i - i)}]")
    result = (i + 1)
    if result > max_i:
        return 1
    else:
        return result

if __name__ == "__main__":
    reset_database()
    seed_database()

    # --- DEBUG ---
    #db = SessionLocal()
    #print("\nInstructor Workloads After Seeding:")
    #for inst in db.query(models.Instructor).all():
    #    print(f"ID={inst.id}, Name={inst.name}, Current Load={inst.current_load}, Max Load={inst.max_load}")
    #db.close()
