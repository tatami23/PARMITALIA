@echo off
title PARMITALIA Private API
cd /d "%~dp0"
"%~dp0..\.venv\Scripts\python.exe" ".\scripts\run_private_api_stdlib.py"
pause
