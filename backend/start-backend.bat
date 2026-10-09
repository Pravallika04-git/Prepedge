@echo off
title PrepEdge Backend Server
echo Starting PrepEdge Backend (Spring Boot)...
set JAVA_HOME=C:\Program Files\Java\jdk-20
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "%~dp0"
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "%%A=%%B"
    )
)
if exist "..\.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("..\.env") do (
        set "%%A=%%B"
    )
)
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    call mvn spring-boot:run
) else (
    call mvnw.cmd spring-boot:run
)
pause
