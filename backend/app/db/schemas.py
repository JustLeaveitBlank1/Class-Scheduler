# backend/app/db/schemas.py
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# ----------------- Course -----------------
class CourseBase(BaseModel):
    code: str
    name: str
    credit_hours: int
    contact_hours: int

class CourseCreate(CourseBase):
    pass

# NOTE: do NOT inherit CourseBase here (to avoid type-override warnings)
class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    credit_hours: Optional[int] = None
    contact_hours: Optional[int] = None

class CourseRead(CourseBase):
    id: int
    # Pydantic v2 way to allow returning ORM objects
    model_config = ConfigDict(from_attributes=True)


# ----------------- Instructor -----------------
class InstructorBase(BaseModel):
    name: str
    email: EmailStr
    current_load: Optional[int] = 0
    department: Optional[str] = None

class InstructorCreate(InstructorBase):
    pass

class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_load: Optional[int] = None
    department: Optional[str] = None

class InstructorRead(InstructorBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ----------------- Meeting Time -----------------
class MeetingTimeBase(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str

class MeetingTimeCreate(MeetingTimeBase):
    pass

class MeetingTimeUpdate(BaseModel):
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class MeetingTimeRead(MeetingTimeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ----------------- Room -----------------
class RoomBase(BaseModel):
    room_number: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    capacity: Optional[int] = None

class RoomRead(RoomBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ================= Sections & Conflicts =================

# Section -----------------
class SectionBase(BaseModel):
    course_id: int
    instructor_id: int
    room_id: int
    meeting_time_id: int
    # optional requested seats for the section (can validate vs. room.capacity later)
    seats: Optional[int] = None

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    course_id: Optional[int] = None
    instructor_id: Optional[int] = None
    room_id: Optional[int] = None
    meeting_time_id: Optional[int] = None
    seats: Optional[int] = None

class SectionRead(SectionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Conflict -----------------
class ConflictBase(BaseModel):
    section_id: int
    conflict_type: str
    description: Optional[str] = None

class ConflictCreate(ConflictBase):
    pass

class ConflictRead(ConflictBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
