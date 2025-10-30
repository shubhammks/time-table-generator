from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base
import enum


class RoomType(str, enum.Enum):
    classroom = "classroom"
    lab = "lab"
    tutorial = "tutorial"


class SubjectType(str, enum.Enum):
    lecture = "lecture"
    lab = "lab"
    tutorial = "tutorial"


class ModeType(str, enum.Enum):
    school = "school"
    college = "college"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, default="Coordinator")
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="coordinator")
    created_at = Column(DateTime, default=datetime.utcnow)


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)


class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    room_number = Column(String(50), nullable=False)
    floor = Column(String(10), nullable=True)  # e.g., D3, 2, etc.
    type = Column(Enum(RoomType), default=RoomType.classroom, nullable=False)
    __table_args__ = (UniqueConstraint("department_id", "room_number", name="uq_room_per_dept"),)


class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_school = Column(Boolean, default=True)


class ClassGroup(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)  # e.g., 10th, FY, SY
    mode = Column(Enum(ModeType), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    number_of_divisions = Column(Integer, default=1)
    fixed_room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)  # for school fixed classroom


class Division(Base):
    __tablename__ = "divisions"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)  # e.g., 10A, FY-A
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    index = Column(Integer, default=0)  # 0-based index A=0, B=1
    batch_count = Column(Integer, default=0)  # 0 for school, up to 3 for college
    __table_args__ = (UniqueConstraint("class_id", "index", name="uq_division_per_class_index"),)


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(SubjectType), default=SubjectType.lecture, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    hours_per_week = Column(Integer, default=0)


class SubjectTeacher(Base):
    __tablename__ = "subject_teachers"
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=True)  # per-division assignment
    __table_args__ = (UniqueConstraint("subject_id", "teacher_id", "division_id", name="uq_subject_teacher_div"),)


class Timetable(Base):
    __tablename__ = "timetables"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    mode = Column(Enum(ModeType), nullable=False)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    id = Column(Integer, primary_key=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    day_index = Column(Integer, nullable=False)  # 0=Mon ... 5=Sat
    period_index = Column(Integer, nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    batch_number = Column(Integer, nullable=True)  # 1/2/3 for batches
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    __table_args__ = (UniqueConstraint("timetable_id", "day_index", "period_index", "division_id", "batch_number", name="uq_slot_unique"),)


class TimeConfig(Base):
    __tablename__ = "time_configs"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    working_days = Column(Integer, default=6)
    periods_per_day = Column(Integer, default=8)
    start_time = Column(String(5), default="09:00")
    lecture_minutes = Column(Integer, default=60)
    lab_minutes = Column(Integer, default=120)
    short_break_after_period = Column(Integer, nullable=True)
    lunch_break_after_period = Column(Integer, nullable=True)
    allow_subject_twice_in_day = Column(Boolean, default=False)
    __table_args__ = (
        UniqueConstraint("department_id", "class_id", name="uq_timeconf_scope"),
    )
