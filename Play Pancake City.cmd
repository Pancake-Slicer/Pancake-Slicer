@echo off
setlocal
cd /d "%~dp0"
set "PANCAKE_PLAYTEST=%~dp0dist\Pancake City - Playtest.html"
if not exist "%PANCAKE_PLAYTEST%" (
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
  call npm.cmd run export:html
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
start "" "%PANCAKE_PLAYTEST%"
