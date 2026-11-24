@echo off
setlocal
pushd "%~dp0"
where caddy >nul 2>&1 || (echo Instale o Caddy no PATH. & exit /b 1)
caddy validate --config Caddyfile --adapter caddyfile || exit /b 1
if not exist "..\..\apps\crm\.next\BUILD_ID" exit /b 1
if not exist "..\..\apps\hub\.next\BUILD_ID" exit /b 1
start "Domus CRM - 3302" /D "..\..\apps\crm" cmd /c "npm run start -- -H 127.0.0.1 -p 3302"
start "Domus Hub - 3301" /D "..\..\apps\hub" cmd /c "npm run start -- -H 127.0.0.1 -p 3301"
caddy run --config Caddyfile --adapter caddyfile
popd
