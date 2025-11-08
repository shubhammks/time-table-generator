1. Give me project structure
2. According to my project structure and requirements used in project , give me versions of requirements to use
You
11:17 PM
3. give me docker-compose file with code for this project and also DockerFile in backend and frontend directory code so that i can deploy project smoothlyj on aws
4. Which services on aws should i use to deploy the project
You
11:21 PM
5. Give me series of commands step by step to deploy this project with the guide of each command and verification and expected result in each step
Shubham Shinde (Shub's)
11:25 PM
fastapi
uvicorn
sqlalchemy
mysql-connector-python
python-multipart
pydantic
bcrypt==4.0.1
passlib
pydantic[email]
python-jose[cryptography]
python-dotenv
Shubham Shinde (Shub's)
11:32 PM
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
Shubham Shinde (Shub's)
11:35 PM
git add .
git commit -m ""
git push origin main

# Smart Timetable Generator – Setup and Run Guide

This repository contains a React frontend and a FastAPI backend for generating school/college timetables with constraints.

## Options to run
- Docker (recommended): one command brings up MySQL, backend, and frontend
- Local dev (Windows/macOS/Linux): run backend and frontend directly

---

## 1) Quick start with Docker
Prerequisites: Docker Desktop

1. Start services
   - From the project root (`tt`):
     ```bash
     docker-compose up -d
     ```
2. Open the apps
   - Backend API: http://localhost:8000 (docs: http://localhost:8000/docs)
   - Frontend: http://localhost:3000
3. Create a coordinator account
   - Use the frontend “Register” page, or via API:
     ```bash
     curl -X POST http://localhost:8000/api/v1/auth/register \
       -H "Content-Type: application/json" \
       -d '{"email":"admin@example.com","password":"admin123","name":"Admin"}'
     ```

Notes
- MySQL credentials are defined in `docker-compose.yml` and `db/init.sql` initializes the DB. The backend connects via `DATABASE_URL` provided in compose.

---

## 2) Local development (without Docker)
### Backend (FastAPI)
Prerequisites: Python 3.11+

1. Create venv and install deps
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate   # Windows
   # source venv/bin/activate  # macOS/Linux
   python -m pip install -r backend/requirements.txt
   ```
2. Configure database (choose one)
   - SQLite (default): no setup needed; creates `timetable.db` in repo root
   - MySQL: set an env var before starting (example):
     ```bash
     set DATABASE_URL=mysql+pymysql://timetable_user:timetable_pass@localhost:3306/timetable_db   # Windows PowerShell: $env:DATABASE_URL = "..."
     ```
3. Run the API
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
4. Open docs at http://127.0.0.1:8000/docs

Tip (Windows): you can use `start_servers.bat` from the project root to launch backend and frontend automatically.

### Frontend (React)
Prerequisites: Node 18+

1. Configure API URL
   - Create `frontend/.env` with:
     ```
     REACT_APP_API_URL=http://localhost:8000/api/v1
     ```
2. Install and run
   ```bash
   cd frontend
   npm install
   npm start
   ```
3. Open http://localhost:3000

---

## Minimal usage flow
1. Login/Register as coordinator in the frontend.
2. Create Department(s), Rooms, Teachers, Classes, Divisions, and Subjects.
3. Go to Generate Timetable (Wizard):
   - Step 1: Choose School or College
   - Step 2: Save time settings (days/periods/durations)
   - Step 3: Assign teachers to each subject per-division
   - Step 4: Generate
4. View timetables; publish if desired.

---

## Key API endpoints (used by the UI)
- Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login-email`, `GET /api/v1/auth/me`
- Data CRUD: `/api/v1/departments`, `/teachers`, `/classes`, `/divisions`, `/rooms`, `/subjects`, `/subject-teachers`
- Time config: `GET/POST /api/v1/time-config` (scope by class_id or department_id)
- Timetable: `POST /api/v1/timetable/generate`, `GET /api/v1/timetable/{id}`, `GET /api/v1/timetable/{id}/grid`, `POST /api/v1/timetable/{id}/publish`

---

## Configuration details
- Breaks: Set via time-config (short/lunch break period indices)
- Labs: Scheduled as two consecutive periods; one lab per subject per day
- School fixed classroom: set `fixed_room_id` on the class (future UI support)
- Subject twice in a day: controlled by time-config (`allow_subject_twice_in_day`)

---

## Troubleshooting
- CORS: Ensure `REACT_APP_API_URL` in frontend matches backend base URL
- Ports busy: stop other processes using 3000/8000/3306
- DB auth: if using your own MySQL, update `DATABASE_URL` accordingly
- Fresh DB: delete `timetable.db` (SQLite) or recreate MySQL database, then restart

---

## Scripts
- Windows quick start: `start_servers.bat`
- Docker: `docker-compose up -d` / `docker-compose down`

---

## Roadmap
- Optimization phase (gap minimization, workload balance, same-floor preference)
- College batch handling (A1/A2/A3)
- Export (PDF/Excel) and teacher availability CRUD
