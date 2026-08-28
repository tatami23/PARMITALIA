@echo off
if exist "%~dp0node_modules\electron\dist\electron.exe" (
  pushd "%~dp0"
  start "Parmitalia Management System" "%~dp0node_modules\electron\dist\electron.exe" .
  popd
) else (
  start "Parmitalia Management System" "%~dp0app\APP_UNIFICATA_CLAL_ANDAMENTI_MERCATO_FINALE_UNIFICATA.html"
)
