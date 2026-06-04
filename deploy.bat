@echo off
echo ========================================
echo   HR Manager - Build for Deploy
echo ========================================

echo.
echo [1/3] Build Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo BUILD FRONTEND THAT BAI!
    pause
    exit /b 1
)

echo.
echo [2/3] Copy dist vao Backend wwwroot...
set WWWROOT=..\backend\HrManager.API\wwwroot
if exist "%WWWROOT%" rmdir /s /q "%WWWROOT%"
xcopy /e /i /y dist "%WWWROOT%"

echo.
echo [3/3] Build Backend...
cd ..\backend\HrManager.API
call dotnet publish -c Release -o .\publish
if errorlevel 1 (
    echo BUILD BACKEND THAT BAI!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD THANH CONG!
echo   Output: backend\HrManager.API\publish\
echo ========================================
pause
