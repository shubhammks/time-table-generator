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
    # Create timetable header
    tt = models.Timetable(
        name=payload.name,
        class_id=payload.class_id,
        department_id=payload.department_id,
        mode=payload.mode,
    )
    db.add(tt)
    db.commit()
    db.refresh(tt)

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

    # Build hard constraint CSP
    days_idx = list(range(working_days))
    periods_idx = list(range(periods_per_day))

    # Requirement: subject hours per division
    required = []  # list of (division_id, subject_id, teacher_id, slots_needed, is_lab)
    by_div = {}
    for d in divisions:
        by_div[d.id] = {}
    # Map per-division teacher assignment
    assign_map = {}
    for a in assignments:
        assign_map[(a.division_id, a.subject_id)] = a.teacher_id
    for s in subjects:
        for d in divisions:
            t_id = assign_map.get((d.id, s.id))
            if not t_id:
                continue
            slots = s.hours_per_week
            if slots and s.type == models.SubjectType.lab:
                # labs consume 2 consecutive periods per session
                # represent as lab sessions count
                sessions = max(1, slots // max(1, (cfg.lab_minutes or 120) // (cfg.lecture_minutes or 60)))
                required.append((d.id, s.id, t_id, sessions, True))
            else:
                required.append((d.id, s.id, t_id, slots, False))

    # State trackers
    teacher_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    room_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    subject_once_map = {}  # key: (division_id, subject_id, day) -> count
    placed = []  # list of TimetableEntry to persist

    # Helper: choose room (fixed for school per class, free any for college)
    fixed_room_id = None
    if payload.mode == models.ModeType.school:
        cls = db.query(models.ClassGroup).get(payload.class_id)
        fixed_room_id = cls.fixed_room_id if cls else None

    # Constraints helpers
    def can_place(day, period, division_id, teacher_id, is_lab, subject_id=None):
        if teacher_id in teacher_busy[(day, period)]:
            return False
        # room collision for fixed room
        if fixed_room_id and fixed_room_id in room_busy[(day, period)]:
            return False
        # lunch/short break enforcement
        if cfg.short_break_after_period is not None and period == cfg.short_break_after_period:
            return False
        if cfg.lunch_break_after_period is not None and period in (cfg.lunch_break_after_period,):
            return False
        # no duplicate subject twice in a day unless allowed
        if not cfg.allow_subject_twice_in_day and subject_id is not None:
            if subject_once_map.get((division_id, subject_id, day), 0) >= 1:
                return False
        return True

    # Simple placement: iterate requirements and assign greedily with backtracking
    def backtrack(idx=0):
        if idx >= len(required):
            return True
        division_id, subject_id, teacher_id, count, is_lab = required[idx]
        # place 'count' sessions
        sessions_placed = 0
        starts = [(d, p) for d in days_idx for p in periods_idx]
        # prefer earlier slots
        for day, period in starts:
            # check lab occupies two consecutive periods
            if is_lab and period + 1 >= periods_per_day:
                continue
            ok = can_place(day, period, division_id, teacher_id, is_lab, subject_id)
            if is_lab:
                ok = ok and can_place(day, period + 1, division_id, teacher_id, is_lab, subject_id)
            if not ok:
                continue
            # room selection
            room_id = fixed_room_id
            if room_id is None:
                room_id = None  # any room; skipping actual allocation for now
            # mark busy
            teacher_busy[(day, period)].add(teacher_id)
            if is_lab:
                teacher_busy[(day, period + 1)].add(teacher_id)
            if fixed_room_id:
                room_busy[(day, period)].add(fixed_room_id)
                if is_lab:
                    room_busy[(day, period + 1)].add(fixed_room_id)
            # mark subject placed once today
            subject_once_map[(division_id, subject_id, day)] = subject_once_map.get((division_id, subject_id, day), 0) + 1
            # add entries
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
            sessions_placed = 1
            if idx + 1 <= len(required):
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
            # unmark subject once
            prev = subject_once_map.get((division_id, subject_id, day), 0)
            if prev > 0:
                subject_once_map[(division_id, subject_id, day)] = prev - 1
            placed.pop()
            if is_lab:
                placed.pop()
        return False

    backtrack(0)

    # persist entries
    for e in placed:
        db.add(e)
    db.commit()

    return {"success": True, "id": tt.id, "message": "Generated with basic constraints", "entries": len(placed)}


@router.get("/{tt_id}/grid", response_model=schemas.GridOut)
def get_grid(tt_id: int, db: Session = Depends(get_db)):
    # Build empty grid of DEFAULT_PERIODS per day
    grid = {day: {str(p): {} for p in range(DEFAULT_PERIODS)} for day in DAYS}
    entries = db.query(models.TimetableEntry).filter(models.TimetableEntry.timetable_id == tt_id).all()
    # Map entries into grid
    for e in entries:
        day = DAYS[e.day_index]
        grid[day][str(e.period_index)] = {
            "subject": {"id": e.subject_id},
            "teacher": {"id": e.teacher_id},
            "room": {"id": e.room_id} if e.room_id else None,
            "division": {"id": e.division_id},
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