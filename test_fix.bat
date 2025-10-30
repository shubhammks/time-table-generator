@echo off
echo ==========================================
echo  TIMETABLE GENERATION FIX - TEST SCRIPT
echo ==========================================
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)

echo.
echo Current directory: %cd%
echo.

echo ==========================================
echo  OPTION 1: Start Backend Server
echo ==========================================
echo Commands to run in a separate terminal:
echo   cd backend
echo   python -m pip install -r requirements.txt
echo   python run.py
echo.
echo Backend will be available at: http://127.0.0.1:8000
echo.

echo ==========================================
echo  OPTION 2: Start Frontend Application  
echo ==========================================
echo Commands to run in another separate terminal:
echo   cd frontend
echo   npm install
echo   npm start
echo.
echo Frontend will be available at: http://localhost:3000
echo.

echo ==========================================
echo  TESTING THE FIX
echo ==========================================
echo 1. Start backend first (Option 1)
echo 2. Start frontend second (Option 2)  
echo 3. Open http://localhost:3000 in browser
echo 4. Login to the application
echo 5. Navigate to Timetables section
echo 6. Click "Generate Timetable" button
echo 7. Verify it shows real generation progress
echo 8. After completion, click "View Timetable"
echo 9. Confirm the timetable displays with real data
echo.

echo ==========================================
echo  WHAT WAS FIXED
echo ==========================================
echo ✅ Real API integration (no more simulation)
echo ✅ Proper backend endpoint calls
echo ✅ Fixed routing issues
echo ✅ Correct data structure handling
echo ✅ Error handling improvements
echo.

echo Press any key to open the fix documentation...
pause
start TIMETABLE_GENERATION_FIX.md
