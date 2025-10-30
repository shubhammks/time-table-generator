from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict, field_validator
from enum import Enum


class RoomType(str, Enum):
    classroom = "classroom"
    lab = "lab"
    tutorial = "tutorial"


class SubjectType(str, Enum):
    lecture = "lecture"
    lab = "lab"
    tutorial = "tutorial"


class ModeType(str, Enum):
    school = "school"
    college = "college"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    name: str
    role: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str = "Coordinator"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class DepartmentIn(BaseModel):
    name: str


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class RoomIn(BaseModel):
    department_id: Optional[int] = None
    room_number: str
    floor: Optional[str] = None
    type: RoomType = RoomType.classroom
    capacity: Optional[int] = None

    @field_validator('department_id', mode='before')
    @classmethod
    def _dept_id_cast(cls, v):
        if v in ("", None):
            return None
        try:
            return int(v)
        except Exception:
            return v

    @field_validator('capacity', mode='before')
    @classmethod
    def _capacity_cast(cls, v):
        if v in ("", None):
            return None
        try:
            return int(v)
        except Exception:
            return v

    @field_validator('floor', mode='before')
    @classmethod
    def _floor_cast(cls, v):
        if v in ("", None):
            return None
        return str(v)


class RoomOut(RoomIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TeacherIn(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    is_school: Optional[bool] = True


class TeacherOut(TeacherIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ClassIn(BaseModel):
    name: str
    mode: ModeType = ModeType.school
    department_id: Optional[int] = None
    number_of_divisions: int = 1
    fixed_room_id: Optional[int] = None


class ClassOut(ClassIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DivisionIn(BaseModel):
    name: str
    class_id: int
    index: int = 0
    batch_count: int = 0

    @field_validator('class_id', 'index', 'batch_count', mode='before')
    @classmethod
    def _div_int_cast(cls, v):
        if v in ("", None):
            return 0 if v == "" else v
        try:
            return int(v)
        except Exception:
            return v


class DivisionOut(DivisionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SubjectIn(BaseModel):
    name: str
    type: SubjectType = SubjectType.lecture
    class_id: int
    hours_per_week: int = 0
    can_be_twice_in_day: bool = False

    @field_validator('class_id', 'hours_per_week', mode='before')
    @classmethod
    def _int_cast(cls, v):
        if v in ("", None):
            # default 0 for hours_per_week; class_id must be provided by UI
            return 0 if v == "" else v
        try:
            return int(v)
        except Exception:
            return v


class SubjectOut(SubjectIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SubjectTeacherIn(BaseModel):
    subject_id: int
    teacher_id: int
    division_id: Optional[int] = None


class SubjectTeacherOut(SubjectTeacherIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TimetableIn(BaseModel):
    name: str
    class_id: int
    department_id: Optional[int] = None
    mode: ModeType
    subject_assignments: List[Any] = []
    options: dict = {}


class TimetableOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    class_id: int
    department_id: Optional[int] = None
    mode: ModeType
    published: bool


class GridOut(BaseModel):
    days: List[str]
    grid: dict


class BatchIn(BaseModel):
    division_id: int
    number: int

    @field_validator('division_id', 'number', mode='before')
    @classmethod
    def _batch_int_cast(cls, v):
        if v in ("", None):
            return 0 if v == "" else v
        try:
            return int(v)
        except Exception:
            return v


class BatchOut(BatchIn):
    id: int
    class Config:
        from_attributes = True


class TimeConfigIn(BaseModel):
    department_id: Optional[int] = None
    class_id: Optional[int] = None
    working_days: int = 6
    periods_per_day: int = 8
    start_time: str = "09:00"
    lecture_minutes: int = 60
    lab_minutes: int = 120
    short_break_after_period: Optional[int] = None
    lunch_break_after_period: Optional[int] = None
    allow_subject_twice_in_day: bool = False


class TimeConfigOut(TimeConfigIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
