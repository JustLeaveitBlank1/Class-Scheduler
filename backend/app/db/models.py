from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    Boolean,
    DateTime,
    Enum as SAEnum,
    Text,
    func,
    Index,
)
from sqlalchemy.orm import relationship
from .database import Base
from enum import Enum as PyEnum

# ----------------- Domain Models -----------------

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=True, index=True, nullable=False)
    credit_hours = Column(Integer, nullable=False)
    contact_hours = Column(Integer, nullable=False)

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

    # Target load for the term (credits/contact-hours)
    target_load = Column(Integer, nullable=True)

    # Kept from your previous schema
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
    room_number = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    constraints = Column(String)

    sections = relationship(
        "Section",
        back_populates="room",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


# NEW: status enum for sections (SQLAlchemy)
class SectionStatus(PyEnum):
    open = "open"
    closed = "closed"


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("instructors.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)

    # Free-form meeting window (store as naive or tz-aware depending on your DB/driver config)
    start = Column(DateTime(timezone=True), nullable=False)
    end   = Column(DateTime(timezone=True), nullable=False)

    # Credits assigned to this section (used for instructor load)
    credits = Column(Integer, nullable=False, default=3)

    status = Column(SAEnum(SectionStatus, name="section_status"), nullable=True)
    section_number = Column(String(16), nullable=True)  # e.g., "-1"
    notes = Column(Text, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete

    # Helpful indexes (cannot express overlap as a DB constraint, we’ll enforce in API)
    __table_args__ = (
        UniqueConstraint("course_id", "section_number", name="uq_course_section_number"),
        Index("ix_sections_room_time", "room_id", "start", "end"),
        Index("ix_sections_instructor_time", "instructor_id", "start", "end"),
    )

    course = relationship("Course", back_populates="sections")
    instructor = relationship("Instructor", back_populates="sections")
    room = relationship("Room", back_populates="sections")

    conflicts = relationship(
        "Conflict",
        back_populates="section",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    conflict_type = Column(String, nullable=False)  # e.g., "room_overlap", "instructor_overlap"
    description = Column(String)

    section = relationship("Section", back_populates="conflicts")


# ----------------- Auth: User -----------------

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
