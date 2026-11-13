@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
call npm run update:buildings
if errorlevel 1 (echo Update failed. The previous accepted buildings are preserved.) else (echo Finished. The new playable HTML files and report are in Downloads.)
pause
