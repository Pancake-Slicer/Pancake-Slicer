@echo off
setlocal
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS to run this benchmark.
  pause
  exit /b 1
)
if not exist node_modules\http-server\bin\http-server (
  call npm.cmd ci
  if errorlevel 1 exit /b 1
)
echo Open http://127.0.0.1:4180 in Chrome or Edge.
echo Drag to turn the building. Scroll to zoom. Keep this window open.
call npm.cmd run benchmark:serve
pause
