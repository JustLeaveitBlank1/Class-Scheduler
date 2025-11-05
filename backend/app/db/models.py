# app/db/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=True, index=True, nullable=False)
    credit_hours = Column(Integer, nullable=False)
    contact_hours = Column(Integer, nullable=False)

    # one Course -> many Sections
    sections = relationship(
        "Section",
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=True)
    max_load = Column(Integer, default=15)
    current_load = Column(Integer, default=0)

    sections = relationship(
        "Section",
        back_populates="instructor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    # Using room_number to match your schemas/seed script
    room_number = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    constraints = Column(String)

    sections = relationship(
        "Section",
        back_populates="room",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class MeetingTime(Base):
    __tablename__ = "meeting_times"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String, nullable=False)   # e.g., "M/W" or "T/Th"
    start_time = Column(String, nullable=False)    # "09:30"
    end_time   = Column(String, nullable=False)    # "10:45"

    sections = relationship(
        "Section",
        back_populates="meeting_time",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("instructors.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    meeting_time_id = Column(Integer, ForeignKey("meeting_times.id", ondelete="CASCADE"), nullable=False)

    # Seats must exist in the DB; app default 0 for new ORM instances
    seats = Column(Integer, nullable=False, default=0)

    # Enforce “no time conflicts” at the DB level too
    __table_args__ = (
        UniqueConstraint("room_id", "meeting_time_id", name="uq_room_time"),
        UniqueConstraint("instructor_id", "meeting_time_id", name="uq_instructor_time"),
    )

    course = relationship("Course", back_populates="sections")
    instructor = relationship("Instructor", back_populates="sections")
    room = relationship("Room", back_populates="sections")
    meeting_time = relationship("MeetingTime", back_populates="sections")

    # one Section -> many Conflicts
    conflicts = relationship(
        "Conflict",
        back_populates="section",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    # must reference sections.id (fixed)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    conflict_type = Column(String, nullable=False)
    description = Column(String)

    # must match Section.conflicts back_populates name
    section = relationship("Section", back_populates="conflicts")
