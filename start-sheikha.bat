@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM 🚀 سكريبت تشغيل منظومة شيخة - Windows
REM Sheikha Startup Script
REM ═══════════════════════════════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     🚀 بدء تشغيل منظومة شيخة للمعادن والسكراب              ║
echo ║     Starting Sheikha Metals ^& Scrap Platform                 ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM المسار للمشروع (عدّل حسب جهازك)
set PROJECT_PATH=C:\Users\%USERNAME%\OneDrive\Sheikha\sheikha-main-portal

REM الانتقال للمجلد
echo 📁 الانتقال لمجلد المشروع...
cd /d "%PROJECT_PATH%"
if errorlevel 1 (
    echo ❌ خطأ: لم يتم العثور على المجلد
    echo 📌 تأكد من المسار: %PROJECT_PATH%
    pause
    exit /b 1
)

REM إيقاف أي خادم سابق على المنفذ 8080
echo 🔄 إيقاف أي خادم سابق...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 1 /nobreak > nul

REM التحقق من وجود node_modules
if not exist "node_modules" (
    echo 📦 تثبيت التبعيات...
    npm install
)

REM تشغيل الخادم
echo ⚡ تشغيل الخادم...
start /B node server.js

REM انتظار بدء الخادم
echo ⏳ انتظار بدء الخادم...
timeout /t 3 /nobreak > nul

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     ✅ منظومة شيخة جاهزة للعمل!                             ║
echo ║     Sheikha Platform is Ready!                               ║
echo ║                                                              ║
echo ║     🌐 الموقع: http://localhost:8080                        ║
echo ║     📊 API: http://localhost:8080/api-docs.html             ║
echo ║     🤖 المساعد: http://localhost:8080/مساعد-شيخة.html       ║
echo ║                                                              ║
echo ║     📌 لإيقاف الخادم: أغلق هذه النافذة                       ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM فتح المتصفح
echo 🌐 فتح المتصفح...
start http://localhost:8080

echo.
echo اضغط أي مفتاح للإغلاق...
pause > nul
