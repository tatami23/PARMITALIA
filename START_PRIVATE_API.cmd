@echo off
title PARMITALIA Private API
cd /d "%~dp0backend"
"%~dp0.venv\Scripts\python.exe" ".\scripts\run_private_api_stdlib.py"
pause
