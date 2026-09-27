@echo off
title PrepEdge Backend Server
echo Starting PrepEdge Backend (Spring Boot)...
set JAVA_HOME=C:\Program Files\Java\jdk-20
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "%~dp0"
call ".\apache-maven-3.9.5\bin\mvn.cmd" spring-boot:run
pause
