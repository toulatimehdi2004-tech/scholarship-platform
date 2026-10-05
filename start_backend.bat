@echo off
echo ========================================================
echo   Starting Scholarship Platform Backend & Ngrok Tunnel
echo ========================================================
start "Django Server" cmd /k ".\venv\Scripts\python.exe manage.py runserver 8000"
start "Ngrok Permanent Tunnel" cmd /k ".\ngrok.exe http 8000 --url https://proofing-harmless-mulled.ngrok-free.dev"
echo.
echo Both servers have been launched in separate windows!
echo Permanent API URL: https://proofing-harmless-mulled.ngrok-free.dev/api
echo Frontend URL:      https://toulatimehdi2004-tech.github.io/scholarship-platform/
echo ========================================================
pause
