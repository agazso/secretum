
@echo off
for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
set ldt=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2% %ldt:~8,2%:%ldt:~10,2%:%ldt:~12,6%
echo ------------ [%ldt%]

echo Compiling...
call tsc %* || exit /b %ERRORLEVEL%
echo Calling browserify...
call browserify -o bin/app.js build/src/client/BrowserChatApplication.js || exit /b %ERRORLEVEL%

