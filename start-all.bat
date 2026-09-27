@echo off
title PrepEdge Full Stack Launcher
echo Starting PrepEdge Application...

start "PrepEdge Backend (Port 8080)" cmd /k "cd /d "%~dp0backend" && start-backend.bat"
start "PrepEdge Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Backend and Frontend launched in separate windows.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080/api
pause
