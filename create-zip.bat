@echo off
echo Creating OTT Web Project ZIP...
echo.

cd /d %~dp0

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing pnpm globally...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install pnpm
        pause
        exit /b 1
    )
)

:: Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Create the ZIP
echo Creating ZIP file...
node scripts\create-zip.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! ZIP file created successfully
    echo ========================================
    echo.
    echo The file web-scaffold.zip has been created
    echo You can now extract and use this scaffold
    echo.
) else (
    echo.
    echo Error: Failed to create ZIP file
    echo.
)

pause
