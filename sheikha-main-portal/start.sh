#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ☪️ بسم الله الرحمن الرحيم
# سكربت تشغيل سوق شيخة — إعادة تشغيل تلقائية عند السقوط
# ═══════════════════════════════════════════════════════════════

export PATH="/usr/local/bin:$PATH"
cd "$(dirname "$0")"

echo "☪️ بسم الله — تشغيل سوق شيخة..."
echo "📁 المسار: $(pwd)"
echo "🔧 Node: $(node --version 2>/dev/null || /usr/local/bin/node --version)"

# إيقاف أي خادم سابق
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

MAX_RESTARTS=10
RESTART_COUNT=0

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo ""
    echo "🚀 بدء الخادم (المحاولة $((RESTART_COUNT+1))/$MAX_RESTARTS)..."
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    
    /usr/local/bin/node server.js 2>&1
    EXIT_CODE=$?
    
    echo ""
    echo "⚠️ الخادم توقف (كود: $EXIT_CODE) — $(date '+%Y-%m-%d %H:%M:%S')"
    
    RESTART_COUNT=$((RESTART_COUNT+1))
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
        echo "🔄 إعادة التشغيل خلال 3 ثواني..."
        sleep 3
    fi
done

echo "🔴 تم استنفاد محاولات إعادة التشغيل ($MAX_RESTARTS)"
