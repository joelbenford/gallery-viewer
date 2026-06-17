@echo off
chcp 65001 > nul

title HDR Gallery Launcher
echo 🚀 Launching High-Performance HDR Pipeline...

:: 1. Launch the TypeScript Backend Server in a new window
echo Starting Fastify Backend on port 3000...
start "HDR Gallery - Backend Server" cmd /k "chcp 65001 > nul && cd /d P:\Shows\backend && npm run dev"

:: 2. Launch the Vite Frontend Client in a second window
echo Starting Vite Frontend on port 5173...
start "HDR Gallery - Web Client" cmd /k "chcp 65001 > nul && cd /d P:\Shows\web-client && npm run dev"

:: 3. Wait 3 seconds for Vite's compiler to spin up, then trigger the default browser link
echo Waiting for build systems to initialize...
timeout /t 3 /nobreak > nul
echo Opening gallery view in web browser...
start http://localhost:5173/

echo.
echo 🎉 Success! This control panel will self destruct in 10 seconds.
echo.
timeout /t 10 /nobreak > nul

exit
