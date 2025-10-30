@echo off
echo ==========================================
echo  TIMETABLE SYSTEM - SERVER STARTER
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "backend\\app\\main.py" (
    echo ERROR: Please run this script from the 'tt' directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Timetable Backend" cmd /k "cd backend && python -m pip install -r backend\backend\requirements.txt >nul 2>&1 && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 >nul

echo Starting Frontend Server...
start "Timetable Frontend" cmd /k "cd frontend && npm install >nul 2>&1 && npm start"

echo.
echo ==========================================
echo  SERVERS STARTED
echo ==========================================
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Two new command prompt windows should have opened.
echo Wait for both servers to fully start, then:
echo.
echo 1. Open http://localhost:3000 in your browser
echo 2. Login to the application  
echo 3. Click 'Timetables' in the sidebar
echo 4. Click 'Create Sample Data' first
echo 5. Then click 'Quick Generate' to create a timetable
echo.
echo Press any key to open the quick start guide...
pause >nul
start QUICK_START_TIMETABLES.md
