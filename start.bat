@echo off
title Al-Rashidi Star ERP Launcher
echo ===================================================
echo     Starting Al-Rashidi Star ERP (Kuwait)
echo ===================================================
echo.

:: Check if backend is already listening on port 3000
netstat -ano | findstr ":3000.*LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Backend server is already running on port 3000.
) else (
    echo [*] Launching Backend Server on port 3000...
    start "ERP Backend (Port 3000)" cmd /k "cd /d %~dp0backend && node dist/main.js"
    timeout /t 3 /nobreak >nul
)

:: Check if frontend is already listening on port 5173
netstat -ano | findstr ":5173.*LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend server is already running on port 5173.
) else (
    echo [*] Launching Frontend Server on port 5173...
    start "ERP Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
    timeout /t 3 /nobreak >nul
)

echo.
echo ===================================================
echo   Opening Al-Rashidi Star ERP in your browser...
echo   URL: http://localhost:5173
echo ===================================================
start http://localhost:5173

pause

