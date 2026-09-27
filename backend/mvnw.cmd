@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

@REM Download maven-wrapper.jar if not present
if not exist %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%"
)

set MAVEN_CMD_LINE_ARGS=%*

if exist "C:\Program Files\Java\jdk-20\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-20"
)

"%JAVA_HOME%\bin\java.exe" ^
  -jar %WRAPPER_JAR% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
