@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Preparing the isolated BMO five-lot review. Normal gameplay stays unchanged.
call npm.cmd run architecture:lightweight:prepare
if errorlevel 1 goto failed
echo Open http://127.0.0.1:4195/lightweight.html in Google Chrome.
echo Keep this window open during review.
node scripts/lightweight-serve.cjs
:failed
pause
