@echo off
REM This script is used to run the node.js tests for the global-extractor project.

:: get script directory
set script_dir=%~dp0

set script="%~dp0global_extractor_test.js"

echo "Use build.py to build and test the project."
timeout /t 5 >nul

@REM run node.js tests
node %script% %*
if %errorlevel% neq 0 (
    echo.
    echo "Node.js tests failed."
    @REM pause
    exit /b %errorlevel%
)
exit /b 0