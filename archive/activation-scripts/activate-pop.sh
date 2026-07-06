#!/bin/bash

# 🚀 Sheikha Pop!_OS Activation Script
# بدون تضارب مع Flatpak VS Code

# Initialize nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 25.6.1 >/dev/null 2>&1 || true

set -e

echo "════════════════════════════════════════════════"
echo "🚀 تفعيل Sheikha على Pop!_OS + PM2"
echo "════════════════════════════════════════════════"
echo ""

# 1️⃣ تحقق من npm و Node.js
echo "[1/5] ✓ التحقق من البيئة..."
command -v npm >/dev/null 2>&1 || { echo "❌ npm غير مثبت"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js غير مثبت"; exit 1; }

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "   ✓ Node.js: $NODE_VERSION"
echo "   ✓ npm: $NPM_VERSION"
echo ""

# 2️⃣ توقف أي نسخة سابقة
echo "[2/5] ⏹️  إيقاف الخادم السابق..."
pkill -9 -f "node server.js" 2>/dev/null || true
sleep 1
echo "   ✓ تم التوقف"
echo ""

# 3️⃣ تثبيت PM2 عالمياً إذا لم يكن مثبتاً
echo "[3/5] 📦 التحقق من PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
    echo "   ℹ️ تثبيت PM2..."
    npm install -g pm2 >/dev/null 2>&1
    echo "   ✓ PM2 مثبت"
else
    echo "   ✓ PM2 موجود"
fi
echo ""

# 4️⃣ شغّل الخادم عبر PM2 بدون conflicts
echo "[4/5] 🚀 تشغيل الخادم على PM2..."
cd "$(dirname "$0")"
pm2 delete sheikha-api 2>/dev/null || true
pm2 start ecosystem.config.js >/dev/null 2>&1
pm2 save >/dev/null 2>&1
echo "   ✓ الخادم يعمل على PM2"
echo ""

# 5️⃣ اعرض الحالة
echo "[5/5] 📊 حالة النظام..."
pm2 status sheikha-api 2>/dev/null || true
echo ""

# ✅ اعرض الـ URLs
echo "════════════════════════════════════════════════"
echo "✅ تفعيل كامل!"
echo "════════════════════════════════════════════════"
echo ""
echo "🌐 الرابط الرئيسي:      http://localhost:8080"
echo "📊 لوحة التحكم:        http://localhost:8080/dashboard"
echo "🤖 AI Autopilot:       ws://localhost:8080/ws/autopilot"
echo ""
echo "💡 أوامر مفيدة:"
echo "   • pm2 logs sheikha-api     — اعرض السجلات"
echo "   • pm2 monit                — المراقبة المباشرة"
echo "   • pm2 stop sheikha-api     — توقف الخادم"
echo "   • pm2 restart sheikha-api  — أعد تشغيل"
echo ""
