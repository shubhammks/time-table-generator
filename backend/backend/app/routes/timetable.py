from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/timetable", tags=["timetable"])

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
DEFAULT_PERIODS = 8


@router.get("/list", response_model=List[schemas.TimetableOut])
def list_timetables(db: Session = Depends(get_db)):
    return db.query(models.Timetable).all()


@router.get("/{tt_id}", response_model=schemas.TimetableOut)
def get_timetable(tt_id: int, db: Session = Depends(get_db)):
    tt = db.query(models.Timetable).get(tt_id)
    if not tt:
        raise HTTPException(status_code=404, detail="Not found")
    return tt


@router.delete("/{tt_id}")
def delete_timetable(tt_id: int, db: Session = Depends(get_db)):
    tt = db.query(models.Timetable).get(tt_id)
    if not tt:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(tt)
    db.commit()
    return {"deleted": True}


@router.post("/generate")
def generate(payload: schemas.TimetableIn, db: Session = Depends(get_db)):
    # Load context
    divisions = db.query(models.Division).filter(models.Division.class_id == payload.class_id).order_by(models.Division.index).all()
    subjects = db.query(models.Subject).filter(models.Subject.class_id == payload.class_id).all()
    assignments = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.division_id.in_([d.id for d in divisions])).all()
    # Time config priority: class -> department -> default
    cfg_q = db.query(models.TimeConfig).filter(models.TimeConfig.class_id == payload.class_id)
    cfg = cfg_q.first()
    if not cfg and payload.department_id:
        cfg = db.query(models.TimeConfig).filter(models.TimeConfig.department_id == payload.department_id).first()
    if not cfg:
        cfg = models.TimeConfig()
    working_days = min(max(cfg.working_days or 6, 5), 6)
    periods_per_day = cfg.periods_per_day or 8

    # Create one timetable per division
    cls = db.query(models.ClassGroup).get(payload.class_id)
    tt_by_div = {}
    for d in divisions:
        tt = models.Timetable(
            name=f"{payload.name} - {d.name}",
            class_id=payload.class_id,
            department_id=payload.department_id,
            mode=payload.mode,
        )
        db.add(tt)
        db.flush()  # get id without full commit
        tt_by_div[d.id] = tt
    db.commit()

    # Build hard constraint CSP (global across divisions to avoid teacher conflicts)
    days_idx = list(range(working_days))
    periods_idx = list(range(periods_per_day))

    # Requirement: subject hours per division
    required = []  # list of (division_id, subject_id, teacher_id, slots_needed, is_lab)
    assign_map = { (a.division_id, a.subject_id): a.teacher_id for a in assignments }
    for s in subjects:
        for d in divisions:
            t_id = assign_map.get((d.id, s.id))
            if not t_id:
                continue
            slots = s.hours_per_week
            if slots and s.type == models.SubjectType.lab:
                sessions = max(1, slots // max(1, (cfg.lab_minutes or 120) // (cfg.lecture_minutes or 60)))
                required.append((d.id, s.id, t_id, sessions, True))
            else:
                required.append((d.id, s.id, t_id, slots, False))

    teacher_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    room_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    subject_once_map = {}
    placed = []

    fixed_room_id = None
    if payload.mode == models.ModeType.school:
        fixed_room_id = cls.fixed_room_id if cls else None

    def can_place(day, period, division_id, teacher_id, is_lab, subject_id=None):
        if teacher_id in teacher_busy[(day, period)]:
            return False
        if fixed_room_id and fixed_room_id in room_busy[(day, period)]:
            return False
        if cfg.short_break_after_period is not None and period == cfg.short_break_after_period:
            return False
        if cfg.lunch_break_after_period is not None and period in (cfg.lunch_break_after_period,):
            return False
        if not cfg.allow_subject_twice_in_day and subject_id is not None:
            if subject_once_map.get((division_id, subject_id, day), 0) >= 1:
                return False
        return True

    def backtrack(idx=0):
        if idx >= len(required):
            return True
        division_id, subject_id, teacher_id, count, is_lab = required[idx]
        starts = [(d, p) for d in days_idx for p in periods_idx]
        for day, period in starts:
            if is_lab and period + 1 >= periods_per_day:
                continue
            ok = can_place(day, period, division_id, teacher_id, is_lab, subject_id)
            if is_lab:
                ok = ok and can_place(day, period + 1, division_id, teacher_id, is_lab, subject_id)
            if not ok:
                continue
            room_id = fixed_room_id if fixed_room_id else None
            teacher_busy[(day, period)].add(teacher_id)
            if is_lab:
                teacher_busy[(day, period + 1)].add(teacher_id)
            if fixed_room_id:
                room_busy[(day, period)].add(fixed_room_id)
                if is_lab:
                    room_busy[(day, period + 1)].add(fixed_room_id)
            subject_once_map[(division_id, subject_id, day)] = subject_once_map.get((division_id, subject_id, day), 0) + 1

            # persist into the division's timetable id
            tt = tt_by_div[division_id]
            e1 = models.TimetableEntry(
                timetable_id=tt.id,
                day_index=day,
                period_index=period,
                division_id=division_id,
                batch_number=None,
                subject_id=subject_id,
                teacher_id=teacher_id,
                room_id=room_id,
            )
            placed.append(e1)
            if is_lab:
                e2 = models.TimetableEntry(
                    timetable_id=tt.id,
                    day_index=day,
                    period_index=period + 1,
                    division_id=division_id,
                    batch_number=None,
                    subject_id=subject_id,
                    teacher_id=teacher_id,
                    room_id=room_id,
                )
                placed.append(e2)
            if backtrack(idx + 1):
                return True
            # undo
            teacher_busy[(day, period)].discard(teacher_id)
            if is_lab:
                teacher_busy[(day, period + 1)].discard(teacher_id)
            if fixed_room_id:
                room_busy[(day, period)].discard(fixed_room_id)
                if is_lab:
                    room_busy[(day, period + 1)].discard(fixed_room_id)
            prev = subject_once_map.get((division_id, subject_id, day), 0)
            if prev > 0:
                subject_once_map[(division_id, subject_id, day)] = prev - 1
            placed.pop()
            if is_lab:
                placed.pop()
        return False

    backtrack(0)

    for e in placed:
        db.add(e)
    db.commit()

    return {"success": True, "ids": [tt.id for tt in tt_by_div.values()], "message": "Generated per-division", "entries": len(placed)}


@router.get("/{tt_id}/grid", response_model=schemas.GridOut)
def get_grid(tt_id: int, db: Session = Depends(get_db)):
    # Build empty grid of DEFAULT_PERIODS per day
    grid = {day: {str(p): {} for p in range(DEFAULT_PERIODS)} for day in DAYS}
    entries = db.query(models.TimetableEntry).filter(models.TimetableEntry.timetable_id == tt_id).all()

    # Preload related entities for names
    subject_ids = {e.subject_id for e in entries}
    teacher_ids = {e.teacher_id for e in entries}
    room_ids = {e.room_id for e in entries if e.room_id}
    division_ids = {e.division_id for e in entries}

    subjects = {s.id: s for s in db.query(models.Subject).filter(models.Subject.id.in_(subject_ids)).all()} if subject_ids else {}
    teachers = {t.id: t for t in db.query(models.Teacher).filter(models.Teacher.id.in_(teacher_ids)).all()} if teacher_ids else {}
    rooms = {r.id: r for r in db.query(models.Room).filter(models.Room.id.in_(room_ids)).all()} if room_ids else {}
    divisions = {d.id: d for d in db.query(models.Division).filter(models.Division.id.in_(division_ids)).all()} if division_ids else {}

    # Map entries into grid with names so UI doesn't show N/A
    for e in entries:
        day = DAYS[e.day_index]
        subj = subjects.get(e.subject_id)
        teach = teachers.get(e.teacher_id)
        room = rooms.get(e.room_id) if e.room_id else None
        div = divisions.get(e.division_id)
        grid[day][str(e.period_index)] = {
            "subject": {"id": e.subject_id, "name": subj.name if subj else None},
            "teacher": {"id": e.teacher_id, "name": teach.name if teach else None},
            "room": ({"id": e.room_id, "room_number": room.room_number, "floor": room.floor, "type": room.type.value} if room else None),
            "division": {"id": e.division_id, "name": div.name if div else None},
            "batch": {"number": e.batch_number} if e.batch_number else None,
        }
    return {"days": DAYS, "grid": grid}


@router.post("/{tt_id}/publish")
def publish_timetable(tt_id: int, db: Session = Depends(get_db)):
    tt = db.query(models.Timetable).get(tt_id)
    if not tt:
        raise HTTPException(status_code=404, detail="Not found")
    tt.published = True
    db.commit()
    return {"published": True}