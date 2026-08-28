@echo off
setlocal
set "APPNAME=ParmitaliaManagement"
set "DEST=%LOCALAPPDATA%\%APPNAME%"
echo Installazione Parmitalia Management System...
if not exist "%DEST%" mkdir "%DEST%"
xcopy "%~dp0*" "%DEST%\" /E /I /Y >nul
set "LAUNCH=%USERPROFILE%\Desktop\Parmitalia Management System.cmd"
(
  echo @echo off
  echo cd /d "%DEST%"
  echo call "%DEST%\Avvia_Parmitalia_Windows.cmd"
) > "%LAUNCH%"
echo.
echo Installazione completata.
echo Avvio creato sul Desktop: %LAUNCH%
pause
