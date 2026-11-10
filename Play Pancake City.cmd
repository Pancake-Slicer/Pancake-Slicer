@echo off
setlocal
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js LTS, then try again.
  pause
  exit /b 1
)
if not exist node_modules\http-server\bin\http-server (
  call npm.cmd ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://127.0.0.1:4173 in Chrome or Edge to play.
echo Keep this window open while playing. Press Ctrl+C to stop.
call npm.cmd start
pause
