from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=True, index=True, nullable=False)
    credit_hours = Column(Integer, nullable=False)
    contact_hours = Column(Integer, nullable=False)

    section = relationship("Section", back_populates="course")

class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=True)
    max_load = Column(Integer, default=15) # default workload requirement
    current_load = Column(Integer, default=0)

    section = relationship("Section", back_populates="instructor")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    constraints = Column(String) # e.g., "no power", "lab space"

    section = relationship("Section", back_populates="room")

class MeetingTime(Base):
    __tablename__ = "meeting_times"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String, unique=True, nullable=False) # e.g., 1400TU
    start_time = Column(String, nullable=False) # e.g., "Tue/Thu 2:00-3:15 PM"
    end_time = Column(String, nullable=False)

    section = relationship("Section", back_populates="meeting_time")

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("instructors.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    meeting_time_id = Column(Integer, ForeignKey("meeting_times.id"), nullable=False)

    course = relationship("Course", back_populates="section")
    instructor = relationship("Instructor", back_populates="section")
    room = relationship("Room", back_populates="section")
    meeting_time = relationship("MeetingTime", back_populates="section")
