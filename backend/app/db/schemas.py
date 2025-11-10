from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from enum import Enum

# ===================== Courses =====================
class CourseBase(BaseModel):
    code: str
    name: str
    credit_hours: int
    contact_hours: int

class CourseCreate(CourseBase): ...
class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    credit_hours: Optional[int] = None
    contact_hours: Optional[int] = None

class CourseRead(CourseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ===================== Instructors =====================
class InstructorBase(BaseModel):
    name: str
    email: EmailStr
    current_load: Optional[int] = 0
    department: Optional[str] = None
    # NEW
    target_load: Optional[int] = None

class InstructorCreate(InstructorBase): ...
class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_load: Optional[int] = None
    department: Optional[str] = None
    target_load: Optional[int] = None

class InstructorRead(InstructorBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ===================== Meeting Times =====================
class MeetingTimeBase(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str

class MeetingTimeCreate(MeetingTimeBase): ...
class MeetingTimeUpdate(BaseModel):
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class MeetingTimeRead(MeetingTimeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ===================== Rooms =====================
class RoomBase(BaseModel):
    room_number: str
    capacity: int

class RoomCreate(RoomBase): ...
class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    capacity: Optional[int] = None

class RoomRead(RoomBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ===================== Sections & Conflicts =====================
class SectionStatus(str, Enum):
    open = "open"
    closed = "closed"

class SectionBase(BaseModel):
    course_id: int
    instructor_id: int
    room_id: int
    meeting_time_id: int
    seats: Optional[int] = None
    # NEW
    status: Optional[SectionStatus] = SectionStatus.open
    section_number: Optional[str] = None
    notes: Optional[str] = None

class SectionCreate(SectionBase): ...
class SectionUpdate(BaseModel):
    course_id: Optional[int] = None
    instructor_id: Optional[int] = None
    room_id: Optional[int] = None
    meeting_time_id: Optional[int] = None
    seats: Optional[int] = None
    status: Optional[SectionStatus] = None
    section_number: Optional[str] = None
    notes: Optional[str] = None

class SectionRead(SectionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ConflictBase(BaseModel):
    section_id: int
    conflict_type: str
    description: Optional[str] = None

class ConflictCreate(ConflictBase): ...
class ConflictRead(ConflictBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ===================== Auth =====================
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[str] = None  # email

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
