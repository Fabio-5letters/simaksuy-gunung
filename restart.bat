@echo off
REM ====================================
REM Script untuk restart SIMAKSI Server
REM ====================================
echo.
echo ========================================
echo   SIMAKSI Server Restart Script
echo ========================================
echo.

REM Find and kill process on port 8081
echo [1/3] Mencari proses di port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    echo [2/3] Menghentikan proses PID %%a...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo     Proses tidak ditemukan atau sudah dihentikan
    ) else (
        echo     Proses berhasil dihentikan!
    )
)

echo.
echo [3/3] Memulai server baru...
echo.
echo ========================================
echo   Server dimulai!
echo   Akses: http://localhost:8081
echo   Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

REM Start server
node app.js
pause
