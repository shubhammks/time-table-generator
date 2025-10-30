import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes.crud import router as crud_router
from .routes.timetable import router as timetable_router
from .routes.dashboard import router as dashboard_router
from .auth import router as auth_router

API_PREFIX = os.getenv("API_V1_STR", "/api/v1")

app = FastAPI(title="Timetable Management API", version="0.1.0")

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(crud_router, prefix=API_PREFIX)
app.include_router(timetable_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "service": "timetable-api"}