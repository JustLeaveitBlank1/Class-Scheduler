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
class CourseUpdate(CourseBase):
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
    current_load: Optional[int] = 0
    department: Optional[str] = None

class InstructorCreate(InstructorBase):
    pass

class InstructorUpdate(InstructorBase):
    pass

class InstructorRead(InstructorBase):
    id: int
    class Config:
        orm_mode = True

# Meeting Time ----------------------------------
class MeetingTimeBase(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str

class MeetingTimeCreate(MeetingTimeBase):
    pass

class MeetingTimeUpdate(MeetingTimeBase):
    pass

class MeetingTimeRead(MeetingTimeBase):
    id: int
    class Config:
        orm_mode = True

# Room ----------------------------------        
class RoomBase(BaseModel):
    room_number: str
    capacity: int
    
class RoomCreate(RoomBase):
    pass

class RoomUpdate(RoomBase):
    pass

class RoomRead(RoomBase):
    id: int
    class Config:
        orm_mode = True
