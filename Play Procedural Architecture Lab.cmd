@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Keep this window open. Open http://127.0.0.1:4187 in Chrome when the server is ready.
call npm run architecture:modernist
pause
