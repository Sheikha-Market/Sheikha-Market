#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 سكريبت تشغيل منظومة شيخة - Mac/Linux
# Sheikha Startup Script
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 بدء تشغيل منظومة شيخة للمعادن والسكراب              ║"
echo "║     Starting Sheikha Metals & Scrap Platform                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# المسار للمشروع
PROJECT_PATH="/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"

# الانتقال للمجلد
echo "📁 الانتقال لمجلد المشروع..."
cd "$PROJECT_PATH" || { echo "❌ خطأ: لم يتم العثور على المجلد"; exit 1; }

# إيقاف أي خادم سابق على المنفذ 8080
echo "🔄 إيقاف أي خادم سابق..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 1

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install
fi

# تشغيل الخادم
echo "⚡ تشغيل الخادم..."
/usr/local/bin/node server.js &
SERVER_PID=$!

# انتظار بدء الخادم
echo "⏳ انتظار بدء الخادم..."
sleep 3

# التحقق من أن الخادم يعمل
if curl -s http://localhost:8080 > /dev/null; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║     ✅ منظومة شيخة جاهزة للعمل!                             ║"
    echo "║     Sheikha Platform is Ready!                               ║"
    echo "║                                                              ║"
    echo "║     🌐 الموقع: http://localhost:8080                        ║"
    echo "║     📊 API: http://localhost:8080/api-docs.html             ║"
    echo "║     🤖 المساعد: http://localhost:8080/مساعد-شيخة.html       ║"
    echo "║                                                              ║"
    echo "║     📌 لإيقاف الخادم: اضغط Ctrl+C                           ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # فتح المتصفح
    echo "🌐 فتح المتصفح..."
    open http://localhost:8080
    
    # انتظار إنهاء الخادم
    wait $SERVER_PID
else
    echo "❌ فشل في تشغيل الخادم!"
    exit 1
fi
