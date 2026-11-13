@echo off
setlocal
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%PATH%"
if not exist node_modules\http-server\bin\http-server (
  call npm.cmd ci
  if errorlevel 1 exit /b 1
)
echo Open http://127.0.0.1:4184 in Chrome or Edge.
echo Drag to orbit. Scroll to zoom. Keep this window open.
call npm.cmd run benchmark:von-badel
pause
