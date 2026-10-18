@echo off
title Forge 3D Print Showcase Server
echo ========================================================
echo   Launching Forge 3D Print Showcase Server...
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 3000
pause
