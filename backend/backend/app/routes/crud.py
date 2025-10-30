from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["crud"])

# Departments
@router.get("/departments", response_model=List[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()


@router.post("/departments", response_model=schemas.DepartmentOut)
def create_department(payload: schemas.DepartmentIn, db: Session = Depends(get_db)):
    dept = models.Department(name=payload.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


# Time configuration
@router.get("/time-config", response_model=schemas.TimeConfigOut)
def get_time_config(db: Session = Depends(get_db), department_id: Optional[int] = None, class_id: Optional[int] = None):
    q = db.query(models.TimeConfig)
    if class_id:
        q = q.filter(models.TimeConfig.class_id == class_id)
    elif department_id:
        q = q.filter(models.TimeConfig.department_id == department_id)
    else:
        q = q.filter(models.TimeConfig.department_id.is_(None), models.TimeConfig.class_id.is_(None))
    cfg = q.first()
    if not cfg:
        # return default
        cfg = models.TimeConfig()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@router.post("/time-config", response_model=schemas.TimeConfigOut)
def upsert_time_config(payload: schemas.TimeConfigIn, db: Session = Depends(get_db)):
    q = db.query(models.TimeConfig)
    if payload.class_id:
        q = q.filter(models.TimeConfig.class_id == payload.class_id)
    elif payload.department_id:
        q = q.filter(models.TimeConfig.department_id == payload.department_id)
    else:
        q = q.filter(models.TimeConfig.department_id.is_(None), models.TimeConfig.class_id.is_(None))
    cfg = q.first()
    if not cfg:
        cfg = models.TimeConfig(**payload.dict())
        db.add(cfg)
    else:
        for k, v in payload.dict().items():
            setattr(cfg, k, v)
    db.commit()
    db.refresh(cfg)
    return cfg


# Rooms
@router.get("/rooms", response_model=List[schemas.RoomOut])
def list_rooms(db: Session = Depends(get_db), department_id: Optional[int] = None):
    q = db.query(models.Room)
    if department_id:
        q = q.filter(models.Room.department_id == department_id)
    return q.all()


@router.post("/rooms", response_model=schemas.RoomOut)
def create_room(payload: schemas.RoomIn, db: Session = Depends(get_db)):
    room = models.Room(**payload.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


# Teachers
@router.get("/teachers", response_model=List[schemas.TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(models.Teacher).all()


@router.post("/teachers", response_model=schemas.TeacherOut)
def create_teacher(payload: schemas.TeacherIn, db: Session = Depends(get_db)):
    teacher = models.Teacher(**payload.dict())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/teachers/{teacher_id}/availability")
def get_teacher_availability(teacher_id: int):
    return {"teacher_id": teacher_id, "availability": "full"}


@router.put("/teachers/{teacher_id}/availability")
def update_teacher_availability(teacher_id: int, availability: dict):
    return {"teacher_id": teacher_id, "availability": availability}


@router.get("/teachers/{teacher_id}/subjects")
def teacher_subjects(teacher_id: int, db: Session = Depends(get_db)):
    joins = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.teacher_id == teacher_id).all()
    return [j.subject_id for j in joins]


# Classes
@router.get("/classes", response_model=List[schemas.ClassOut])
def list_classes(db: Session = Depends(get_db)):
    return db.query(models.ClassGroup).all()


@router.post("/classes", response_model=schemas.ClassOut)
def create_class(payload: schemas.ClassIn, db: Session = Depends(get_db)):
    c = models.ClassGroup(**payload.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    # auto-create divisions if needed
    for i in range(payload.number_of_divisions):
        d = models.Division(name=f"{payload.name}{chr(65+i)}", class_id=c.id, index=i)
        db.add(d)
    db.commit()
    return c


@router.put("/classes/{class_id}", response_model=schemas.ClassOut)
def update_class(class_id: int, payload: schemas.ClassIn, db: Session = Depends(get_db)):
    c = db.query(models.ClassGroup).get(class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    # update simple fields
    for k, v in payload.dict().items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    c = db.query(models.ClassGroup).get(class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    # also delete divisions for this class
    db.query(models.Division).filter(models.Division.class_id == c.id).delete()
    db.delete(c)
    db.commit()
    return {"deleted": True}


# Divisions
@router.get("/divisions", response_model=List[schemas.DivisionOut])
def list_divisions(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Division)
    if class_id:
        q = q.filter(models.Division.class_id == class_id)
    return q.all()


@router.get("/divisions/{division_id}/timetable")
def division_timetable(division_id: int, db: Session = Depends(get_db)):
    entries = db.query(models.TimetableEntry).filter(models.TimetableEntry.division_id == division_id).all()
    return {"division_id": division_id, "entries": len(entries)}


@router.get("/divisions/{division_id}/students-count")
def division_students_count(division_id: int):
    return {"division_id": division_id, "students_count": 0}


# Subjects
@router.get("/subjects", response_model=List[schemas.SubjectOut])
def list_subjects(db: Session = Depends(get_db), class_id: Optional[int] = None):
    q = db.query(models.Subject)
    if class_id:
        q = q.filter(models.Subject.class_id == class_id)
    return q.all()


@router.post("/subjects", response_model=schemas.SubjectOut)
def create_subject(payload: schemas.SubjectIn, db: Session = Depends(get_db)):
    s = models.Subject(**payload.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


# Subject-Teacher assignments
@router.get("/subject-teachers", response_model=List[schemas.SubjectTeacherOut])
def list_subject_teachers(
    db: Session = Depends(get_db), subject_id: Optional[int] = None, division_id: Optional[int] = None
):
    q = db.query(models.SubjectTeacher)
    if subject_id:
        q = q.filter(models.SubjectTeacher.subject_id == subject_id)
    if division_id:
        q = q.filter(models.SubjectTeacher.division_id == division_id)
    return q.all()


@router.post("/subject-teachers", response_model=schemas.SubjectTeacherOut)
def create_subject_teacher(payload: schemas.SubjectTeacherIn, db: Session = Depends(get_db)):
    st = models.SubjectTeacher(**payload.dict())
    db.add(st)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Duplicate assignment")
    db.refresh(st)
    return st


@router.delete("/subject-teachers/{assignment_id}")
def delete_subject_teacher(assignment_id: int, db: Session = Depends(get_db)):
    st = db.query(models.SubjectTeacher).get(assignment_id)
    if not st:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(st)
    db.commit()
    return {"deleted": True}