@echo off
REM n8n Workflow Backup Script for Windows
REM This script provides instructions for exporting workflows from n8n

set BACKUP_DIR=.\workflows\exports
set N8N_URL=http://localhost:8080
set DATETIME=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATETIME=%DATETIME: =0%

echo 📁 Creating workflow backup directory: %BACKUP_DIR%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 🔄 n8n Workflow Export Guide
echo.
echo Manual Export:
echo 1. Go to %N8N_URL% (n8n interface)
echo 2. Navigate to 'Workflows' tab
echo 3. Select workflows to export
echo 4. Click 'Export' button
echo 5. Save the exported JSON files to %BACKUP_DIR%
echo.
echo API Export:
echo curl -X GET "%N8N_URL%/api/v1/workflows" -H "Content-Type: application/json"
echo.

REM Create README if it doesn't exist
if not exist "%BACKUP_DIR%\README.md" (
    echo # n8n Workflow Exports > "%BACKUP_DIR%\README.md"
    echo. >> "%BACKUP_DIR%\README.md"
    echo This directory contains exported n8n workflows for version control. >> "%BACKUP_DIR%\README.md"
    echo. >> "%BACKUP_DIR%\README.md"
    echo ## Export Methods >> "%BACKUP_DIR%\README.md"
    echo. >> "%BACKUP_DIR%\README.md"
    echo ### Manual Export >> "%BACKUP_DIR%\README.md"
    echo 1. Open n8n interface at %N8N_URL% >> "%BACKUP_DIR%\README.md"
    echo 2. Go to Workflows tab >> "%BACKUP_DIR%\README.md"
    echo 3. Select workflow^(s^) to export >> "%BACKUP_DIR%\README.md"
    echo 4. Click Export button >> "%BACKUP_DIR%\README.md"
    echo 5. Save JSON files here >> "%BACKUP_DIR%\README.md"
)

echo ✅ Backup structure created in %BACKUP_DIR%
pause
