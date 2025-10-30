from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def stats():
    return {
        "teachers": 0,
        "classes": 0,
        "divisions": 0,
        "timetables": 0,
    }


@router.get("/recent-activities")
def recent():
    return []


@router.get("/health")
def health():
    return {"status": "ok"}