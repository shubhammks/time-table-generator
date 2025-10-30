from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/timetable", tags=["timetable"])

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
DEFAULT_PERIODS = 8


@router.get("/list")
def list_timetables(db: Session = Depends(get_db)):
    items = db.query(models.Timetable).all()
    # enrich with is_published, created_at iso, and class name
    class_ids = {i.class_id for i in items}
    classes = {c.id: c for c in db.query(models.ClassGroup).filter(models.ClassGroup.id.in_(class_ids)).all()} if class_ids else {}
    out = []
    for i in items:
        cls = classes.get(i.class_id)
        out.append({
            "id": i.id,
            "name": i.name,
            "class_id": i.class_id,
            "class_name": cls.name if cls else None,
            "department_id": i.department_id,
            "mode": i.mode.value if hasattr(i.mode, 'value') else str(i.mode),
            "is_published": bool(i.published),
            "created_at": i.created_at.isoformat() if getattr(i, 'created_at', None) else None,
        })
    return out


@router.get("/{tt_id}")
def get_timetable(tt_id: int, db: Session = Depends(get_db)):
    tt = db.query(models.Timetable).get(tt_id)
    if not tt:
        raise HTTPException(status_code=404, detail="Not found")
    cls = db.query(models.ClassGroup).get(tt.class_id) if tt.class_id else None
    return {
        "id": tt.id,
        "name": tt.name,
        "class_id": tt.class_id,
        "class_name": cls.name if cls else None,
        "department_id": tt.department_id,
        "mode": tt.mode.value if hasattr(tt.mode, 'value') else str(tt.mode),
        "is_published": bool(tt.published),
        "created_at": tt.created_at.isoformat() if getattr(tt, 'created_at', None) else None,
    }


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
    subjects_by_id = {s.id: s for s in subjects}
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

    # Requirement: subject hours per division (flatten per session)
    # required: (division_id, subject_id, teacher_id, subject_type)
    required = []
    assign_map = { (a.division_id, a.subject_id): a.teacher_id for a in assignments }

    for s in subjects:
        for d in divisions:
            t_id = assign_map.get((d.id, s.id))
            if not t_id:
                # no teacher for this division+subject; skip (do not borrow from other divisions)
                continue
            slots = int(s.hours_per_week or 0)
            if slots <= 0:
                continue
            if s.type == models.SubjectType.lab:
                # Each lab session occupies 2 periods; interpret hours_per_week as number of periods, approximate sessions
                session_len = max(1, int((cfg.lab_minutes or 120) / max(1, (cfg.lecture_minutes or 60))))
                sessions = max(1, slots // session_len)
                for _ in range(sessions):
                    required.append((d.id, s.id, t_id, models.SubjectType.lab))
            else:
                for _ in range(slots):
                    required.append((d.id, s.id, t_id, s.type))

    # Priority: schedule LAB first, then TUTORIAL, then LECTURE
    priority_order = {models.SubjectType.lab: 0, getattr(models.SubjectType, 'tutorial', models.SubjectType.lecture): 1, models.SubjectType.lecture: 2}
    required.sort(key=lambda x: priority_order.get(x[3], 3))

    teacher_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    room_busy = {(day, p): set() for day in days_idx for p in periods_idx}
    subject_once_map = {}
    placed = []
    # Track counts per (division, subject)
    required_counts = {}
    for (div_id, subj_id, _teacher, subj_type) in required:
        required_counts[(div_id, subj_id)] = required_counts.get((div_id, subj_id), 0) + 1
    # Session counts actually placed (lab counted once per 2 periods)
    placed_session_counts = {}
    def inc_count(div_id, subj_id):
        placed_session_counts[(div_id, subj_id)] = placed_session_counts.get((div_id, subj_id), 0) + 1

    fixed_room_id = None
    if payload.mode == models.ModeType.school:
        fixed_room_id = cls.fixed_room_id if cls else None
        if cls and not fixed_room_id:
            # auto-assign first classroom as fixed room for the class if not set
            any_classroom = db.query(models.Room).filter(models.Room.type == models.RoomType.classroom).first()
            if any_classroom:
                fixed_room_id = any_classroom.id
                cls.fixed_room_id = fixed_room_id
                db.commit()

    def can_place(day, period, division_id, teacher_id, subject_type, subject_id=None):
        if teacher_id in teacher_busy[(day, period)]:
            return False
        # room collision for fixed room
        if fixed_room_id and fixed_room_id in room_busy[(day, period)]:
            return False
        if cfg.short_break_after_period is not None and period == cfg.short_break_after_period:
            return False
        if cfg.lunch_break_after_period is not None and period in (cfg.lunch_break_after_period,):
            return False
        # no duplicate subject twice in a day unless allowed globally or per subject flag
        if subject_id is not None:
            subj = subjects_by_id.get(subject_id)
            allow_twice = bool(cfg.allow_subject_twice_in_day or (subj.can_be_twice_in_day if subj else False))
            if not allow_twice and subject_once_map.get((division_id, subject_id, day), 0) >= 1:
                return False
        return True

    # Preload rooms for allocation when no fixed room
    all_rooms = db.query(models.Room).all()

    def pick_room(day, period, subject_type):
        # prefer allowed room numbers (enforced by building policy), then fall back by type
        if subject_type == models.SubjectType.lab:
            desired_type = models.RoomType.lab
            allowed_numbers = {"103", "104"}
        elif subject_type == models.SubjectType.tutorial:
            desired_type = models.RoomType.tutorial
            allowed_numbers = {"105"}
        else:
            desired_type = models.RoomType.classroom
            allowed_numbers = {"101", "102"}

        # pass 1: strict by number regardless of saved type
        for r in all_rooms:
            if str(r.room_number) in allowed_numbers and r.id not in room_busy[(day, period)]:
                return r.id
        # pass 2: match by type only
        for r in all_rooms:
            if r.type == desired_type and r.id not in room_busy[(day, period)]:
                return r.id
        # no room available
        return None

    def backtrack(idx=0):
        if idx >= len(required):
            return True
        division_id, subject_id, teacher_id, subject_type = required[idx]
        starts = [(d, p) for d in days_idx for p in periods_idx]
        for day, period in starts:
            is_lab = subject_type == models.SubjectType.lab
            # labs need two consecutive periods
            if is_lab and period + 1 >= periods_per_day:
                continue
            ok = can_place(day, period, division_id, teacher_id, subject_type, subject_id)
            if is_lab:
                ok = ok and can_place(day, period + 1, division_id, teacher_id, subject_type, subject_id)
            if not ok:
                continue
            room_id = fixed_room_id if fixed_room_id and subject_type == models.SubjectType.lecture else pick_room(day, period, subject_type)
            if room_id is None:
                continue
            # mark busy
            teacher_busy[(day, period)].add(teacher_id)
            if is_lab:
                teacher_busy[(day, period + 1)].add(teacher_id)
            if room_id:
                room_busy[(day, period)].add(room_id)
                if is_lab:
                    room_busy[(day, period + 1)].add(room_id)
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
                inc_count(division_id, subject_id)
            else:
                inc_count(division_id, subject_id)
            if backtrack(idx + 1):
                return True
            # undo
            teacher_busy[(day, period)].discard(teacher_id)
            if is_lab:
                teacher_busy[(day, period + 1)].discard(teacher_id)
            if room_id:
                room_busy[(day, period)].discard(room_id)
                if is_lab:
                    room_busy[(day, period + 1)].discard(room_id)
            prev = subject_once_map.get((division_id, subject_id, day), 0)
            if prev > 0:
                subject_once_map[(division_id, subject_id, day)] = prev - 1
            placed.pop()
            if is_lab:
                placed.pop()
        return False

    solved = backtrack(0)

    # If counts are short, try a relaxed fill (allow same subject twice per day if needed)
    def place_relaxed(div_id, subj_id, teacher_id, subj_type):
        for day in days_idx:
            for period in periods_idx:
                is_lab = subj_type == models.SubjectType.lab
                if is_lab and period + 1 >= periods_per_day:
                    continue
                # relax subject_once rule
                if teacher_id in teacher_busy[(day, period)]:
                    continue
                if is_lab and teacher_id in teacher_busy[(day, period + 1)]:
                    continue
                room_id = fixed_room_id if fixed_room_id and subj_type == models.SubjectType.lecture else pick_room(day, period, subj_type)
                if room_id is None:
                    continue
                # mark busy
                teacher_busy[(day, period)].add(teacher_id)
                if is_lab:
                    teacher_busy[(day, period + 1)].add(teacher_id)
                room_busy[(day, period)].add(room_id)
                if is_lab:
                    room_busy[(day, period + 1)].add(room_id)
                # persist
                tt = tt_by_div[div_id]
                e1 = models.TimetableEntry(
                    timetable_id=tt.id,
                    day_index=day,
                    period_index=period,
                    division_id=div_id,
                    batch_number=None,
                    subject_id=subj_id,
                    teacher_id=teacher_id,
                    room_id=room_id,
                )
                placed.append(e1)
                if is_lab:
                    e2 = models.TimetableEntry(
                        timetable_id=tt.id,
                        day_index=day,
                        period_index=period + 1,
                        division_id=div_id,
                        batch_number=None,
                        subject_id=subj_id,
                        teacher_id=teacher_id,
                        room_id=room_id,
                    )
                    placed.append(e2)
                    inc_count(div_id, subj_id)
                else:
                    inc_count(div_id, subj_id)
                return True
        return False

    # Fill deficits
    for (div_id, subj_id), req in required_counts.items():
        got = placed_session_counts.get((div_id, subj_id), 0)
        if got < req:
            teacher_id = assign_map.get((div_id, subj_id))
            subj_type = subjects_by_id[subj_id].type if subjects_by_id.get(subj_id) else models.SubjectType.lecture
            for _ in range(req - got):
                placed_ok = place_relaxed(div_id, subj_id, teacher_id, subj_type)
                if not placed_ok:
                    break

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
            "room": ({"id": e.room_id, "room_number": room.room_number, "floor": room.floor, "type": room.type.value} if room else {"id": None, "room_number": "-"}),
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