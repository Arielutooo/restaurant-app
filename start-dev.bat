@echo off
REM Script para Windows para iniciar todos los servicios

echo Starting Restaurant Digital System...
echo.

REM Verificar MongoDB
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo WARNING: MongoDB does not appear to be running
    echo Please start MongoDB first
    pause
    exit /b 1
)

echo MongoDB is running
echo.

REM Instalar dependencias si es necesario
if not exist "backend\node_modules" (
    echo Installing dependencies...
    call npm run install:all
    echo.
)

REM Inicializar base de datos si es necesario
echo Checking database...
cd backend
node src\scripts\seedData.js
cd ..
echo.

echo Starting services...
echo.

REM Crear directorio de logs
if not exist "logs" mkdir logs

REM Iniciar Backend
echo Starting Backend (port 4000)...
start "Restaurant Backend" /MIN cmd /c "cd backend && npm run dev > ..\logs\backend.log 2>&1"

REM Esperar 3 segundos
timeout /t 3 /nobreak > nul

REM Iniciar CRM
echo Starting CRM (port 4001)...
start "Restaurant CRM" /MIN cmd /c "cd crm && npm run dev > ..\logs\crm.log 2>&1"

REM Esperar 3 segundos
timeout /t 3 /nobreak > nul

REM Iniciar Frontend
echo Starting Frontend (port 3000)...
start "Restaurant Frontend" /MIN cmd /c "cd frontend && npm run dev > ..\logs\frontend.log 2>&1"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo URLs:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:4000
echo   CRM:       http://localhost:4001
echo.
echo Waiter PIN: 1234
echo.
echo Check logs folder for service logs
echo.
echo To stop services, close the opened windows
echo or run: taskkill /F /FI "WindowTitle eq Restaurant*"
echo.
pause

