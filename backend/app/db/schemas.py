from pydantic import BaseModel, EmailStr
from typing import Optional

# Course ----------------------------------
# Shared properities
class CourseBase(BaseModel):
    code: str
    name: str
    credit_hours: int
    contact_hours: int

# When creating a new course, all fields are required
class CourseCreate(CourseBase):
    pass

# When updating a course, allow partial updates
class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    credit_hours: Optional[int] = None
    contact_hours: Optional[int] = None

# Response (e.g., when reading from DB)
class CourseRead(CourseBase):
    id: int
    class Config:
        orm_mode = True

# Instructor ----------------------------------
class InstructorBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    max_load: int

class InstructorCreate(InstructorBase):
    name: str
    email: EmailStr
    department: Optional[str] = None
    max_load: int

class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    max_load: Optional[int] = None

class InstructorRead(InstructorBase):
    id: int
    current_load: int
    class Config:
        orm_mode = True

# Meeting Time ----------------------------------
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
    class Config:
        orm_mode = True

# Room ----------------------------------        
class RoomBase(BaseModel):
    name: str
    capacity: int
    constraints: Optional[str] = None
    
class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    constraints: Optional[str] = None

class RoomRead(RoomBase):
    id: int
    class Config:
        orm_mode = True

# Section ----------------------------------
class SectionBase(BaseModel):
    course_id: int
    instructor_id: int
    room_id: int
    meeting_time_id: int

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    course_id: Optional[int] = None
    instructor_id: Optional[int] = None
    room_id: Optional[int] = None
    meeting_time_id: Optional[int] = None

class SectionRead(SectionBase):
    id: int
    class Config:
        orm_mode = True

# Conflict ----------------------------------
class ConflictBase(BaseModel):
    conflict_type: str
    description: Optional[str] = None

class ConflictRead(ConflictBase):
    id: int
    class Config:
        orm_mode = True
