@echo off
echo ========================================================
echo   Starting Scholarship Platform Backend & Public Tunnel
echo ========================================================
start "Django Server" cmd /k ".\venv\Scripts\python.exe manage.py runserver 8000"
start "Cloudflare Public Tunnel" cmd /k "%TEMP%\cloudflared.exe tunnel --url http://localhost:8000"
echo.
echo Both servers have been launched in separate windows!
echo Your frontend at https://toulatimehdi2004-tech.github.io/scholarship-platform/
echo is now connected and ready to receive requests.
echo ========================================================
pause
