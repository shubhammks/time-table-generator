import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./timetable.db")

# For SQLite need check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    # Lightweight SQLite migrations for newly added columns
    if engine.dialect.name == "sqlite":
        with engine.connect() as conn:
            # rooms.capacity
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info('rooms')").fetchall()]
            if "capacity" not in cols:
                conn.exec_driver_sql("ALTER TABLE rooms ADD COLUMN capacity INTEGER")
            # subjects.can_be_twice_in_day
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info('subjects')").fetchall()]
            if "can_be_twice_in_day" not in cols:
                conn.exec_driver_sql("ALTER TABLE subjects ADD COLUMN can_be_twice_in_day BOOLEAN DEFAULT 0")
            # batches table
            tables = [row[0] for row in conn.exec_driver_sql("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
            if "batches" not in tables:
                Base.metadata.create_all(bind=engine)  # ensure Batch is created