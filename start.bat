@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title TEACHER OS - The Intelligent Operating System for Teachers

echo ====================================================================
echo   TEACHER OS -- نظام تشغيل المعلم الذكي (بوابة السناتر والدروس الخصوصية)
echo ====================================================================
echo.

set "NODE_BIN=%~dp0..\tools\node-v20.18.0-win-x64\node.exe"

if exist "%NODE_BIN%" (
    echo [OK] Using portable Node.js runtime...
    start "" http://localhost:3000
    "%NODE_BIN%" backend\src\server.js
) else (
    where node >nul 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Using system Node.js...
        start "" http://localhost:3000
        node backend\src\server.js
    ) else (
        echo [ERROR] Node.js runtime not found!
        echo Please make sure node.exe is located in scratch\tools or installed on system.
        pause
    )
)
pause
